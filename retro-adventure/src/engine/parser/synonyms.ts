// Verb synonyms mapping
export const verbSynonyms: Record<string, string> = {
  // Look
  l: 'look',
  look: 'look',
  see: 'look',
  observe: 'look',

  // Go / directions
  go: 'go',
  walk: 'go',
  move: 'go',
  run: 'go',
  travel: 'go',
  n: 'go north',
  north: 'go north',
  s: 'go south',
  south: 'go south',
  e: 'go east',
  east: 'go east',
  w: 'go west',
  west: 'go west',
  u: 'go up',
  up: 'go up',
  d: 'go down',
  down: 'go down',

  // Take
  take: 'take',
  get: 'take',
  grab: 'take',
  pick: 'take',
  pickup: 'take',
  acquire: 'take',

  // Drop
  drop: 'drop',
  put: 'drop',
  discard: 'drop',
  leave: 'drop',

  // Inventory
  inventory: 'inventory',
  inv: 'inventory',
  i: 'inventory',
  items: 'inventory',

  // Use
  use: 'use',
  apply: 'use',
  activate: 'use',

  // Examine
  examine: 'examine',
  x: 'examine',
  inspect: 'examine',
  study: 'examine',
  read: 'examine',
  check: 'examine',

  // Talk
  talk: 'talk',
  speak: 'talk',
  say: 'talk',
  ask: 'talk',

  // System commands
  help: 'help',
  '?': 'help',
  save: 'save',
  load: 'load',
  restore: 'load',
  restart: 'restart',
  reset: 'restart',
  quit: 'restart',

  // Debug
  debug: 'debug',
};

// Direction mappings
export const directions = ['north', 'south', 'east', 'west', 'up', 'down'];
export const directionAbbrevs: Record<string, string> = {
  n: 'north',
  s: 'south',
  e: 'east',
  w: 'west',
  u: 'up',
  d: 'down',
};

// Prepositions to strip
export const prepositions = ['on', 'with', 'to', 'at', 'in', 'into', 'onto', 'the', 'a', 'an'];

// Noise words to ignore
export const noiseWords = ['the', 'a', 'an', 'please', 'can', 'you', 'i', 'want', 'to', 'would', 'like'];
