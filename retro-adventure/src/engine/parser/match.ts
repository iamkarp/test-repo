import type { Intent, Verb, Direction, WorldState } from '../types';
import { verbSynonyms, directionAbbrevs, directions } from './synonyms';
import { tokenize, extractParts } from './tokenize';
import { gameContent, roomFeatures } from '../../content';

/**
 * Resolve a noun string to an item ID
 */
function resolveNoun(
  noun: string,
  state: WorldState
): { id: string; ambiguous?: string[] } | null {
  if (!noun) return null;

  const normalizedNoun = noun.toLowerCase().trim();
  const currentRoom = gameContent.rooms[state.currentRoomId];

  // Collect all visible items: room items + inventory + room features
  const visibleItemIds = new Set<string>();

  // Room items
  const roomState = state.roomStates[state.currentRoomId];
  const roomItems = roomState?.items || currentRoom.items;
  roomItems.forEach((id) => visibleItemIds.add(id));

  // Inventory items
  state.inventory.forEach((id) => visibleItemIds.add(id));

  // Room features (non-portable objects like doors, gates)
  const features = roomFeatures[state.currentRoomId] || [];
  features.forEach((id) => visibleItemIds.add(id));

  // Special: wizard is visible in wizard_throne
  if (state.currentRoomId === 'wizard_throne' && !state.flags.wizard_defeated) {
    visibleItemIds.add('wizard');
  }

  // Find matching items
  const matches: string[] = [];

  for (const itemId of visibleItemIds) {
    const item = gameContent.items[itemId];
    if (!item) continue;

    // Check name and aliases
    const namesToCheck = [item.name.toLowerCase(), ...item.aliases.map((a) => a.toLowerCase())];

    for (const name of namesToCheck) {
      if (name === normalizedNoun || name.includes(normalizedNoun) || normalizedNoun.includes(name)) {
        if (!matches.includes(itemId)) {
          matches.push(itemId);
        }
        break;
      }
    }
  }

  if (matches.length === 0) return null;
  if (matches.length === 1) return { id: matches[0] };
  return { id: matches[0], ambiguous: matches };
}

/**
 * Parse raw input into an Intent
 */
export function parseCommand(input: string, state: WorldState): Intent {
  const raw = input;
  const tokens = tokenize(input);

  if (tokens.length === 0) {
    return { verb: 'unknown', raw };
  }

  // Expand verb synonyms
  let verb = tokens[0];
  const expandedVerb = verbSynonyms[verb];

  // Handle direction shortcuts (n, s, e, w, etc.)
  if (expandedVerb && expandedVerb.startsWith('go ')) {
    const dir = expandedVerb.split(' ')[1] as Direction;
    return { verb: 'go', direction: dir, raw };
  }

  // Handle standalone directions
  if (directions.includes(verb) || directionAbbrevs[verb]) {
    const dir = (directionAbbrevs[verb] || verb) as Direction;
    return { verb: 'go', direction: dir, raw };
  }

  // Map to canonical verb
  const canonicalVerb = (expandedVerb || verb) as Verb;

  // Extract parts for complex commands
  const parts = extractParts(tokens);

  // Build intent based on verb
  switch (canonicalVerb) {
    case 'look':
      // "look" alone or "look at X"
      if (parts.object) {
        const resolved = resolveNoun(parts.object, state);
        return { verb: 'examine', objectId: resolved?.id, raw };
      }
      return { verb: 'look', raw };

    case 'go': {
      // "go north" or just "north"
      let dir = parts.object;
      if (directionAbbrevs[dir]) {
        dir = directionAbbrevs[dir];
      }
      if (directions.includes(dir)) {
        return { verb: 'go', direction: dir as Direction, raw };
      }
      return { verb: 'go', raw }; // Invalid direction will be caught later
    }

    case 'take':
    case 'drop': {
      const resolved = resolveNoun(parts.object, state);
      return {
        verb: canonicalVerb,
        objectId: resolved?.id,
        raw,
      };
    }

    case 'examine': {
      const resolved = resolveNoun(parts.object, state);
      return {
        verb: 'examine',
        objectId: resolved?.id,
        raw,
      };
    }

    case 'use': {
      const resolved = resolveNoun(parts.object, state);
      const targetResolved = parts.target ? resolveNoun(parts.target, state) : null;
      return {
        verb: 'use',
        objectId: resolved?.id,
        targetId: targetResolved?.id,
        raw,
      };
    }

    case 'talk': {
      const resolved = resolveNoun(parts.object, state);
      return {
        verb: 'talk',
        objectId: resolved?.id,
        raw,
      };
    }

    case 'inventory':
    case 'help':
    case 'save':
    case 'load':
    case 'restart':
      return { verb: canonicalVerb, raw };

    case 'debug':
      return { verb: 'debug', objectId: parts.object, raw };

    default:
      return { verb: 'unknown', raw };
  }
}
