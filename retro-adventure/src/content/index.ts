import type { GameContent } from '../engine/types';
import { rooms, startRoom, introText } from './rooms';
import { items, roomFeatures } from './items';
import { scripts, roomTriggers, deathConditions } from './scripts';

export const gameContent: GameContent = {
  rooms,
  items,
  npcs: {},
  scripts,
  startRoom,
  introText,
};

export { roomFeatures, roomTriggers, deathConditions };
export { introText };
