import type { Intent, ActionResult, WorldState, GameFlags } from '../types';
import { gameContent } from '../../content';
import { scripts } from '../../content/scripts';

/**
 * Execute a script by ID
 */
export function executeScript(
  scriptId: string,
  state: WorldState
): ActionResult | null {
  const script = scripts[scriptId];
  if (!script) return null;

  // Check conditions
  if (script.conditions) {
    for (const condition of script.conditions) {
      const flagValue = state.flags[condition.flag];
      if (flagValue !== condition.value) {
        // Condition not met - try finding an alternative script
        // e.g., "light_torch_already" if torch is already lit
        const altScriptId = `${scriptId}_already`;
        if (scripts[altScriptId]) {
          return executeScript(altScriptId, state);
        }
        return null;
      }
    }
  }

  // Check required item
  if (script.requiresItem && !state.inventory.includes(script.requiresItem)) {
    const item = gameContent.items[script.requiresItem];
    return {
      text: `You need the ${item?.name || script.requiresItem} to do that.`,
      type: 'error',
    };
  }

  // Execute effects
  const textLines: string[] = [];
  const flagUpdates: Partial<GameFlags> = {};
  const itemUpdates: ActionResult['itemUpdates'] = {};
  let teleport: string | undefined;
  let gameOver = false;
  let victory = false;

  for (const effect of script.effects) {
    switch (effect.type) {
      case 'text':
        textLines.push(effect.value as string);
        break;
      case 'flag':
        if (effect.target) {
          flagUpdates[effect.target] = effect.value as boolean | number | string;
        }
        break;
      case 'removeItem':
        if (effect.target === 'inventory') {
          itemUpdates.removeFromInventory = [
            ...(itemUpdates.removeFromInventory || []),
            effect.value as string,
          ];
        }
        break;
      case 'teleport':
        teleport = effect.value as string;
        break;
      case 'gameOver':
        gameOver = effect.value as boolean;
        break;
      case 'victory':
        victory = effect.value as boolean;
        break;
    }
  }

  return {
    text: textLines,
    type: 'narration',
    flagUpdates: Object.keys(flagUpdates).length > 0 ? flagUpdates : undefined,
    itemUpdates: Object.keys(itemUpdates).length > 0 ? itemUpdates : undefined,
    teleport,
    gameOver,
    victory,
  };
}

/**
 * Handle USE command
 */
export function handleUse(intent: Intent, state: WorldState): ActionResult {
  if (!intent.objectId) {
    return { text: 'Use what?', type: 'error' };
  }

  const item = gameContent.items[intent.objectId];
  if (!item) {
    return { text: "You don't have that.", type: 'error' };
  }

  // Check if player has the item or if it's a room feature
  const hasItem = state.inventory.includes(intent.objectId);
  const isFeature = !item.portable;

  if (!hasItem && !isFeature) {
    return { text: "You don't have that.", type: 'error' };
  }

  // If using on a target
  if (intent.targetId) {
    const target = gameContent.items[intent.targetId];
    if (!target) {
      return { text: "You don't see that here.", type: 'error' };
    }

    // Check if item can be used on this target
    if (item.usableOn && item.usableOn.includes(intent.targetId)) {
      // Find and execute the appropriate script
      const scriptId = item.onUse || target.onUse;
      if (scriptId) {
        const result = executeScript(scriptId, state);
        if (result) return result;
      }
    }

    // Also check if target can accept this item
    if (target.usableOn && target.usableOn.includes(intent.objectId)) {
      const scriptId = target.onUse;
      if (scriptId) {
        const result = executeScript(scriptId, state);
        if (result) return result;
      }
    }

    return {
      text: `You cannot use the ${item.name} on the ${target.name}.`,
      type: 'error',
    };
  }

  // Using item alone
  if (item.onUse) {
    const result = executeScript(item.onUse, state);
    if (result) return result;
  }

  return {
    text: `You're not sure how to use the ${item.name} by itself.`,
    type: 'error',
  };
}

/**
 * Check for room enter triggers
 */
export function checkRoomTriggers(
  roomId: string,
  state: WorldState
): ActionResult | null {
  const room = gameContent.rooms[roomId];
  if (!room) return null;

  // Special victory condition for reaching freedom
  if (roomId === 'freedom' && state.flags.wizard_defeated) {
    return {
      text: [
        'As you step into the sunlight, warmth floods through you. You\'ve done it!',
        '',
        'The Cave of the Ice Wizard is no more. Its ancient evil has been vanquished.',
        'Behind you, the cave begins to collapse as the wizard\'s magic fades.',
        '',
        '═══════════════════════════════════════════════════════',
        '              CONGRATULATIONS!',
        '        You have completed the adventure!',
        '═══════════════════════════════════════════════════════',
      ],
      type: 'narration',
      victory: true,
    };
  }

  return null;
}
