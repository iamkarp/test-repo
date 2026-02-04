import type { WorldState } from '../types';

const SAVE_KEY = 'ice_wizard_save';
const SAVE_VERSION = 1;

interface SaveData {
  version: number;
  timestamp: number;
  state: Omit<WorldState, 'log'>;
}

/**
 * Save game state to localStorage
 */
export function saveGame(state: WorldState): boolean {
  try {
    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      state: {
        currentRoomId: state.currentRoomId,
        inventory: state.inventory,
        flags: state.flags,
        roomStates: state.roomStates,
        turn: state.turn,
        gameOver: state.gameOver,
        victory: state.victory,
      },
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

/**
 * Load game state from localStorage
 */
export function loadGame(): Omit<WorldState, 'log'> | null {
  try {
    const savedJson = localStorage.getItem(SAVE_KEY);
    if (!savedJson) return null;

    const saveData: SaveData = JSON.parse(savedJson);

    // Version check for future compatibility
    if (saveData.version !== SAVE_VERSION) {
      console.warn('Save version mismatch, may have compatibility issues');
    }

    return saveData.state;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

/**
 * Check if a save exists
 */
export function hasSavedGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Delete saved game
 */
export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

/**
 * Get save info without loading full state
 */
export function getSaveInfo(): { timestamp: number; roomId: string; turn: number } | null {
  try {
    const savedJson = localStorage.getItem(SAVE_KEY);
    if (!savedJson) return null;

    const saveData: SaveData = JSON.parse(savedJson);
    return {
      timestamp: saveData.timestamp,
      roomId: saveData.state.currentRoomId,
      turn: saveData.state.turn,
    };
  } catch {
    return null;
  }
}
