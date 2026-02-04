// Core game types for the retro text adventure engine

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export type LogType = 'narration' | 'system' | 'error' | 'command';

export interface LogEntry {
  text: string;
  type: LogType;
  turn: number;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  exits: Partial<Record<Direction, string>>;
  items: string[];
  features?: string[];
  onEnter?: string;
  artKey?: string;
  dark?: boolean;
  blockedExits?: Partial<Record<Direction, { flag: string; message: string }>>;
}

export interface Item {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  portable: boolean;
  usableOn?: string[];
  onUse?: string;
  onExamine?: string;
  hidden?: boolean;
  lightSource?: boolean;
}

export interface NPC {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  dialogue: Record<string, { text: string; nextState?: string; requires?: string; sets?: string }>;
  currentState: string;
  location: string;
}

export interface GameFlags {
  [key: string]: boolean | number | string;
}

export interface RoomState {
  items: string[];
  visited: boolean;
}

export interface WorldState {
  currentRoomId: string;
  inventory: string[];
  flags: GameFlags;
  roomStates: Record<string, RoomState>;
  log: LogEntry[];
  turn: number;
  gameOver: boolean;
  victory: boolean;
  pendingDisambiguation?: {
    verb: string;
    candidates: string[];
    targetId?: string;
  };
}

export type Verb =
  | 'look'
  | 'go'
  | 'take'
  | 'drop'
  | 'inventory'
  | 'use'
  | 'examine'
  | 'talk'
  | 'help'
  | 'save'
  | 'load'
  | 'restart'
  | 'debug'
  | 'unknown';

export interface Intent {
  verb: Verb;
  objectId?: string;
  targetId?: string;
  direction?: Direction;
  raw: string;
  disambiguation?: number;
}

export interface ActionResult {
  text: string | string[];
  type: LogType;
  stateUpdates?: Partial<WorldState>;
  flagUpdates?: Partial<GameFlags>;
  itemUpdates?: {
    addToInventory?: string[];
    removeFromInventory?: string[];
    addToRoom?: { roomId: string; items: string[] };
    removeFromRoom?: { roomId: string; items: string[] };
  };
  teleport?: string;
  gameOver?: boolean;
  victory?: boolean;
}

export interface GameContent {
  rooms: Record<string, Room>;
  items: Record<string, Item>;
  npcs: Record<string, NPC>;
  scripts: Record<string, ScriptAction>;
  startRoom: string;
  introText: string[];
}

export interface ScriptAction {
  id: string;
  conditions?: { flag: string; value: boolean | number | string }[];
  requiresItem?: string;
  requiresTarget?: string;
  effects: ScriptEffect[];
}

export interface ScriptEffect {
  type: 'text' | 'flag' | 'item' | 'teleport' | 'gameOver' | 'victory' | 'removeItem' | 'unlockExit';
  value: string | boolean | number;
  target?: string;
  room?: string;
}
