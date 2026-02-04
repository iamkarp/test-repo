import { create } from 'zustand';
import type { WorldState, LogEntry, ActionResult } from './types';
import { parseCommand } from './parser';
import {
  handleLook,
  handleGo,
  handleTake,
  handleDrop,
  handleInventory,
  handleExamine,
  handleHelp,
  handleUse,
  checkRoomTriggers,
} from './actions';
import { saveGame, loadGame, deleteSave } from './io';
import { gameContent, introText } from '../content';

interface GameStore extends WorldState {
  // Actions
  initialize: () => void;
  processCommand: (input: string) => void;
  addLog: (text: string | string[], type: LogEntry['type']) => void;
  save: () => boolean;
  load: () => boolean;
  restart: () => void;
}

function createInitialState(): WorldState {
  const initialRoomStates: Record<string, { items: string[]; visited: boolean }> = {};

  // Initialize room states from content
  Object.keys(gameContent.rooms).forEach((roomId) => {
    const room = gameContent.rooms[roomId];
    initialRoomStates[roomId] = {
      items: [...room.items],
      visited: false,
    };
  });

  return {
    currentRoomId: gameContent.startRoom,
    inventory: [],
    flags: {
      torch_lit: false,
      stone_door_open: false,
      iron_gate_open: false,
      wizard_defeated: false,
      scroll_read: false,
      tablet_read: false,
    },
    roomStates: initialRoomStates,
    log: [],
    turn: 0,
    gameOver: false,
    victory: false,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  initialize: () => {
    const state = get();

    // Add intro text
    introText.forEach((line) => {
      state.addLog(line, 'narration');
    });

    // Show initial room
    const lookResult = handleLook(state);
    state.addLog(lookResult.text, lookResult.type);

    // Mark starting room as visited
    set((s) => ({
      roomStates: {
        ...s.roomStates,
        [s.currentRoomId]: {
          ...s.roomStates[s.currentRoomId],
          visited: true,
        },
      },
    }));
  },

  addLog: (text, type) => {
    const lines = Array.isArray(text) ? text : [text];
    const turn = get().turn;

    set((state) => ({
      log: [
        ...state.log,
        ...lines.map((t) => ({ text: t, type, turn })),
      ],
    }));
  },

  processCommand: (input) => {
    const state = get();

    if (state.gameOver || state.victory) {
      state.addLog('The adventure has ended. Type RESTART to begin again.', 'system');
      return;
    }

    // Log the command
    state.addLog(`> ${input}`, 'command');

    // Parse command
    const intent = parseCommand(input, state);

    // Execute command
    let result: ActionResult;

    switch (intent.verb) {
      case 'look':
        result = handleLook(state);
        break;
      case 'go':
        result = handleGo(intent, state);
        break;
      case 'take':
        result = handleTake(intent, state);
        break;
      case 'drop':
        result = handleDrop(intent, state);
        break;
      case 'inventory':
        result = handleInventory(state);
        break;
      case 'examine':
        result = handleExamine(intent, state);
        break;
      case 'use':
        result = handleUse(intent, state);
        break;
      case 'help':
        result = handleHelp();
        break;
      case 'save':
        if (state.save()) {
          result = { text: 'Game saved.', type: 'system' };
        } else {
          result = { text: 'Failed to save game.', type: 'error' };
        }
        break;
      case 'load':
        if (state.load()) {
          result = { text: 'Game loaded.', type: 'system' };
          // Show current room after loading
          const postLoadState = get();
          const lookResult = handleLook(postLoadState);
          state.addLog(result.text, result.type);
          state.addLog(lookResult.text, lookResult.type);
          return;
        } else {
          result = { text: 'No saved game found.', type: 'error' };
        }
        break;
      case 'restart':
        state.restart();
        return;
      case 'debug':
        if (intent.objectId === 'state') {
          console.log('Game State:', state);
          result = { text: 'State logged to console.', type: 'system' };
        } else if (intent.objectId?.startsWith('teleport ')) {
          const roomId = intent.objectId.replace('teleport ', '');
          if (gameContent.rooms[roomId]) {
            set({ currentRoomId: roomId });
            result = { text: `Teleported to ${roomId}.`, type: 'system' };
          } else {
            result = { text: 'Invalid room ID.', type: 'error' };
          }
        } else if (intent.objectId?.startsWith('flag ')) {
          const flagName = intent.objectId.replace('flag ', '');
          set((s) => ({
            flags: { ...s.flags, [flagName]: true },
          }));
          result = { text: `Flag ${flagName} set to true.`, type: 'system' };
        } else {
          result = {
            text: 'Debug commands: debug state, debug teleport <roomId>, debug flag <flagName>',
            type: 'system',
          };
        }
        break;
      default:
        result = {
          text: "I don't understand that command. Type HELP for a list of commands.",
          type: 'error',
        };
    }

    // Output result
    state.addLog(result.text, result.type);

    // Apply state updates
    const updates: Partial<WorldState> = { turn: state.turn + 1 };

    if (result.flagUpdates) {
      updates.flags = { ...state.flags, ...result.flagUpdates } as WorldState['flags'];
    }

    if (result.itemUpdates) {
      let newInventory = [...state.inventory];
      const newRoomStates = { ...state.roomStates };

      if (result.itemUpdates.addToInventory) {
        newInventory = [...newInventory, ...result.itemUpdates.addToInventory];
      }
      if (result.itemUpdates.removeFromInventory) {
        newInventory = newInventory.filter(
          (id) => !result.itemUpdates!.removeFromInventory!.includes(id)
        );
      }
      if (result.itemUpdates.addToRoom) {
        const { roomId, items } = result.itemUpdates.addToRoom;
        newRoomStates[roomId] = {
          ...newRoomStates[roomId],
          items: [...(newRoomStates[roomId]?.items || []), ...items],
        };
      }
      if (result.itemUpdates.removeFromRoom) {
        const { roomId, items } = result.itemUpdates.removeFromRoom;
        newRoomStates[roomId] = {
          ...newRoomStates[roomId],
          items: (newRoomStates[roomId]?.items || []).filter(
            (id) => !items.includes(id)
          ),
        };
      }

      updates.inventory = newInventory;
      updates.roomStates = newRoomStates;
    }

    if (result.gameOver) {
      updates.gameOver = true;
    }

    if (result.victory) {
      updates.victory = true;
    }

    // Handle room change (teleport)
    if (result.teleport) {
      updates.currentRoomId = result.teleport;

      // Apply updates first so room triggers see updated state
      set(updates);

      // Mark room as visited
      const currentRoomStates = get().roomStates;
      set({
        roomStates: {
          ...currentRoomStates,
          [result.teleport]: {
            ...currentRoomStates[result.teleport],
            visited: true,
          },
        },
      });

      // Check room triggers
      const triggerResult = checkRoomTriggers(result.teleport, get());
      if (triggerResult) {
        state.addLog(triggerResult.text, triggerResult.type);
        if (triggerResult.gameOver) {
          set({ gameOver: true });
        }
        if (triggerResult.victory) {
          set({ victory: true });
        }
      } else {
        // Auto-look on room entry
        const newLookResult = handleLook(get());
        state.addLog(newLookResult.text, newLookResult.type);
      }
    } else {
      set(updates);
    }
  },

  save: () => {
    return saveGame(get());
  },

  load: () => {
    const savedState = loadGame();
    if (!savedState) return false;

    set({
      ...savedState,
      log: get().log, // Keep current log
    });
    return true;
  },

  restart: () => {
    deleteSave();
    const initialState = createInitialState();
    set({
      ...initialState,
      log: [],
    });

    // Re-initialize
    setTimeout(() => {
      get().initialize();
    }, 0);
  },
}));
