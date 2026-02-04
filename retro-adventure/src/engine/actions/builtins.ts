import type { Intent, ActionResult, WorldState, Direction } from '../types';
import { gameContent, roomFeatures } from '../../content';

/**
 * Get visible items in current room
 */
function getVisibleItems(state: WorldState): string[] {
  const currentRoom = gameContent.rooms[state.currentRoomId];
  const roomState = state.roomStates[state.currentRoomId];
  const items = roomState?.items || currentRoom.items;
  const features = roomFeatures[state.currentRoomId] || [];
  return [...items, ...features];
}

/**
 * Check if a room is dark and player has no light
 */
function isInDarkness(state: WorldState): boolean {
  const currentRoom = gameContent.rooms[state.currentRoomId];
  return currentRoom.dark === true && !state.flags.torch_lit;
}

/**
 * LOOK - Describe current room
 */
export function handleLook(state: WorldState): ActionResult {
  const room = gameContent.rooms[state.currentRoomId];

  if (isInDarkness(state)) {
    return {
      text: [
        'It is pitch black. You cannot see anything.',
        'You hear dripping water echoing in the darkness.',
        'You should find a light source before proceeding.',
      ],
      type: 'narration',
    };
  }

  const lines: string[] = [];
  lines.push(`═══ ${room.name.toUpperCase()} ═══`);
  lines.push('');
  lines.push(room.description);

  // List visible items
  const visibleItems = getVisibleItems(state);
  const portableItems = visibleItems
    .map((id) => gameContent.items[id])
    .filter((item) => item && item.portable && !item.hidden);

  if (portableItems.length > 0) {
    lines.push('');
    lines.push('You can see:');
    portableItems.forEach((item) => {
      lines.push(`  - ${item.name}`);
    });
  }

  // List exits
  const exitDirs = Object.keys(room.exits) as Direction[];
  if (exitDirs.length > 0) {
    lines.push('');
    const exitList = exitDirs.map((dir) => {
      const blocked = room.blockedExits?.[dir];
      if (blocked && !state.flags[blocked.flag]) {
        return `${dir} (blocked)`;
      }
      return dir;
    });
    lines.push(`Exits: ${exitList.join(', ')}`);
  }

  return { text: lines, type: 'narration' };
}

/**
 * GO - Move to another room
 */
export function handleGo(intent: Intent, state: WorldState): ActionResult {
  if (!intent.direction) {
    return { text: 'Go where? Specify a direction (north, south, east, west, up, down).', type: 'error' };
  }

  const room = gameContent.rooms[state.currentRoomId];
  const targetRoomId = room.exits[intent.direction];

  if (!targetRoomId) {
    return { text: 'You cannot go that way.', type: 'error' };
  }

  // Check for blocked exits
  const blocked = room.blockedExits?.[intent.direction];
  if (blocked && !state.flags[blocked.flag]) {
    return { text: blocked.message, type: 'narration' };
  }

  return {
    text: `You head ${intent.direction}.`,
    type: 'narration',
    teleport: targetRoomId,
  };
}

/**
 * TAKE - Pick up an item
 */
export function handleTake(intent: Intent, state: WorldState): ActionResult {
  if (!intent.objectId) {
    return { text: 'Take what?', type: 'error' };
  }

  const item = gameContent.items[intent.objectId];
  if (!item) {
    return { text: "You don't see that here.", type: 'error' };
  }

  // Check if item is in the room
  const visibleItems = getVisibleItems(state);
  if (!visibleItems.includes(intent.objectId)) {
    return { text: "You don't see that here.", type: 'error' };
  }

  // Check if already in inventory
  if (state.inventory.includes(intent.objectId)) {
    return { text: 'You already have that.', type: 'error' };
  }

  // Check if portable
  if (!item.portable) {
    return { text: `You cannot take the ${item.name}.`, type: 'error' };
  }

  // Check darkness
  if (isInDarkness(state)) {
    return { text: 'It is too dark to see what you are doing.', type: 'error' };
  }

  return {
    text: `You take the ${item.name}.`,
    type: 'narration',
    itemUpdates: {
      addToInventory: [intent.objectId],
      removeFromRoom: { roomId: state.currentRoomId, items: [intent.objectId] },
    },
  };
}

/**
 * DROP - Drop an item from inventory
 */
export function handleDrop(intent: Intent, state: WorldState): ActionResult {
  if (!intent.objectId) {
    return { text: 'Drop what?', type: 'error' };
  }

  const item = gameContent.items[intent.objectId];
  if (!item) {
    return { text: "You don't have that.", type: 'error' };
  }

  // Check if in inventory
  if (!state.inventory.includes(intent.objectId)) {
    return { text: "You don't have that.", type: 'error' };
  }

  return {
    text: `You drop the ${item.name}.`,
    type: 'narration',
    itemUpdates: {
      removeFromInventory: [intent.objectId],
      addToRoom: { roomId: state.currentRoomId, items: [intent.objectId] },
    },
  };
}

/**
 * INVENTORY - List carried items
 */
export function handleInventory(state: WorldState): ActionResult {
  if (state.inventory.length === 0) {
    return { text: 'You are not carrying anything.', type: 'narration' };
  }

  const lines = ['You are carrying:'];
  state.inventory.forEach((itemId) => {
    const item = gameContent.items[itemId];
    if (item) {
      lines.push(`  - ${item.name}`);
    }
  });

  return { text: lines, type: 'narration' };
}

/**
 * EXAMINE - Look closely at something
 */
export function handleExamine(intent: Intent, state: WorldState): ActionResult {
  if (!intent.objectId) {
    return { text: 'Examine what?', type: 'error' };
  }

  const item = gameContent.items[intent.objectId];
  if (!item) {
    return { text: "You don't see that here.", type: 'error' };
  }

  // Check if visible
  const visibleItems = getVisibleItems(state);
  const hasItem = visibleItems.includes(intent.objectId) || state.inventory.includes(intent.objectId);

  // Special check for wizard
  if (intent.objectId === 'wizard' && state.currentRoomId === 'wizard_throne' && !state.flags.wizard_defeated) {
    return { text: item.description, type: 'narration' };
  }

  if (!hasItem && intent.objectId !== 'wizard') {
    return { text: "You don't see that here.", type: 'error' };
  }

  if (isInDarkness(state)) {
    return { text: 'It is too dark to examine anything.', type: 'error' };
  }

  return { text: item.description, type: 'narration' };
}

/**
 * HELP - Show available commands
 */
export function handleHelp(): ActionResult {
  const helpText = [
    '═══ AVAILABLE COMMANDS ═══',
    '',
    'LOOK (L)         - Describe your surroundings',
    'GO <dir>         - Move in a direction (N/S/E/W/UP/DOWN)',
    'TAKE <item>      - Pick up an item',
    'DROP <item>      - Drop an item from inventory',
    'INVENTORY (I)    - List what you are carrying',
    'EXAMINE <thing>  - Look closely at something',
    'USE <item>       - Use an item',
    'USE <item> ON <target> - Use an item on something',
    '',
    'SAVE             - Save your progress',
    'LOAD             - Load saved game',
    'RESTART          - Start over',
    'HELP             - Show this help',
    '',
    'TIP: You can use abbreviations like N, S, E, W for directions',
    'and L for LOOK, I for INVENTORY, X for EXAMINE.',
  ];

  return { text: helpText, type: 'system' };
}
