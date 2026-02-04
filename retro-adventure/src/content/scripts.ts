import type { ScriptAction } from '../engine/types';

export const scripts: Record<string, ScriptAction> = {
  light_torch: {
    id: 'light_torch',
    conditions: [{ flag: 'torch_lit', value: false }],
    requiresItem: 'old_torch',
    effects: [
      { type: 'text', value: 'You hold the crystal shard against the torch. The magical energy within the crystal flares to life, igniting the oil-soaked rags. The torch burns with a warm, steady flame!' },
      { type: 'flag', value: true, target: 'torch_lit' },
      { type: 'text', value: 'The darkness recedes before your light. You can now see clearly in the dark passages.' },
    ],
  },
  light_torch_already: {
    id: 'light_torch_already',
    conditions: [{ flag: 'torch_lit', value: true }],
    effects: [
      { type: 'text', value: 'The torch is already lit and burning brightly.' },
    ],
  },
  open_stone_door: {
    id: 'open_stone_door',
    conditions: [{ flag: 'stone_door_open', value: false }],
    requiresItem: 'crystal_shard',
    effects: [
      { type: 'text', value: 'You insert the crystal shard into the slot in the stone door. It fits perfectly!' },
      { type: 'text', value: 'The crystal begins to glow intensely, and ancient mechanisms grind to life within the walls.' },
      { type: 'text', value: 'With a thunderous rumble, the stone door slowly slides open, revealing the path eastward.' },
      { type: 'flag', value: true, target: 'stone_door_open' },
      { type: 'removeItem', value: 'crystal_shard', target: 'inventory' },
    ],
  },
  use_rusty_key: {
    id: 'use_rusty_key',
    conditions: [{ flag: 'iron_gate_open', value: false }],
    requiresItem: 'rusty_key',
    effects: [
      { type: 'text', value: 'You insert the rusty key into the ancient lock. Despite centuries of disuse, it turns with a satisfying click.' },
      { type: 'text', value: 'The glowing runes flicker and fade as the gate\'s magical seal is broken.' },
      { type: 'text', value: 'The iron gate swings open with a long, mournful creak. The path to the wizard\'s throne lies open!' },
      { type: 'flag', value: true, target: 'iron_gate_open' },
    ],
  },
  open_iron_gate: {
    id: 'open_iron_gate',
    conditions: [{ flag: 'iron_gate_open', value: false }],
    requiresItem: 'rusty_key',
    effects: [
      { type: 'text', value: 'You insert the rusty key into the ancient lock. Despite centuries of disuse, it turns with a satisfying click.' },
      { type: 'text', value: 'The glowing runes flicker and fade as the gate\'s magical seal is broken.' },
      { type: 'text', value: 'The iron gate swings open with a long, mournful creak. The path to the wizard\'s throne lies open!' },
      { type: 'flag', value: true, target: 'iron_gate_open' },
    ],
  },
  use_thermal_orb: {
    id: 'use_thermal_orb',
    conditions: [{ flag: 'wizard_defeated', value: false }],
    requiresItem: 'thermal_orb',
    effects: [
      { type: 'text', value: 'You raise the Thermal Orb before the Ice Wizard. His eyes widen with recognition and fear.' },
      { type: 'text', value: '"NO! THE ORB OF ETERNAL SUMMER! WHERE DID YOU-" his voice cracks like breaking ice.' },
      { type: 'text', value: 'The orb pulses with intense heat, waves of warmth radiating outward. The wizard screams as his frozen form begins to melt.' },
      { type: 'text', value: 'In moments, the ancient terror is reduced to nothing but a puddle of water and a pile of empty robes.' },
      { type: 'text', value: 'The curse is broken! You feel the entire cave begin to warm slightly. The frozen adventurers in the antechamber might yet be saved!' },
      { type: 'flag', value: true, target: 'wizard_defeated' },
      { type: 'text', value: 'The path to the treasure vault lies open before you.' },
    ],
  },
  defeat_wizard: {
    id: 'defeat_wizard',
    conditions: [{ flag: 'wizard_defeated', value: false }],
    requiresItem: 'thermal_orb',
    effects: [
      { type: 'text', value: 'You raise the Thermal Orb before the Ice Wizard. His eyes widen with recognition and fear.' },
      { type: 'text', value: '"NO! THE ORB OF ETERNAL SUMMER! WHERE DID YOU-" his voice cracks like breaking ice.' },
      { type: 'text', value: 'The orb pulses with intense heat, waves of warmth radiating outward. The wizard screams as his frozen form begins to melt.' },
      { type: 'text', value: 'In moments, the ancient terror is reduced to nothing but a puddle of water and a pile of empty robes.' },
      { type: 'text', value: 'The curse is broken! You feel the entire cave begin to warm slightly.' },
      { type: 'flag', value: true, target: 'wizard_defeated' },
    ],
  },
  read_scroll: {
    id: 'read_scroll',
    effects: [
      { type: 'text', value: 'The scroll reads: "The Ice Wizard\'s power is absolute within his domain, but one artifact exists that can undo him - the Thermal Orb, hidden in a secret grotto west of the Crystal Chamber. Seek the narrow crack..."' },
      { type: 'flag', value: true, target: 'scroll_read' },
    ],
  },
  read_tablet: {
    id: 'read_tablet',
    effects: [
      { type: 'text', value: 'The runes on the tablet glow as you examine them. They form an ancient inscription: "THE GATE YIELDS TO THE KEY OF RUST AND TIME."' },
      { type: 'flag', value: true, target: 'tablet_read' },
    ],
  },
  enter_freedom: {
    id: 'enter_freedom',
    conditions: [{ flag: 'wizard_defeated', value: true }],
    effects: [
      { type: 'text', value: 'As you step into the sunlight, warmth floods through you. You\'ve done it!' },
      { type: 'text', value: 'The Cave of the Ice Wizard is no more. Its ancient evil has been vanquished.' },
      { type: 'text', value: 'You are victorious!' },
      { type: 'victory', value: true },
    ],
  },
  wizard_freeze: {
    id: 'wizard_freeze',
    conditions: [{ flag: 'wizard_defeated', value: false }],
    effects: [
      { type: 'text', value: 'The wizard raises his hand and speaks a word of power. Frost begins to creep up your legs...' },
      { type: 'text', value: '"WITH LUCK, YOU WILL THAW IN SEVERAL MILLION YEARS," he laughs.' },
      { type: 'text', value: 'Your vision fades to white as the cold claims you.' },
      { type: 'gameOver', value: true },
    ],
  },
  darkness_death: {
    id: 'darkness_death',
    conditions: [{ flag: 'torch_lit', value: false }],
    effects: [
      { type: 'text', value: 'You stumble blindly in the darkness. Your foot finds nothing but empty air...' },
      { type: 'text', value: 'You plummet into an unseen chasm. The fall seems to last forever.' },
      { type: 'gameOver', value: true },
    ],
  },
};

// Room enter triggers
export const roomTriggers: Record<string, string> = {
  freedom: 'enter_freedom',
};

// Death conditions for certain actions without proper preparation
export const deathConditions: Record<string, { flag: string; script: string }> = {
  torch_hall: { flag: 'torch_lit', script: 'darkness_death' },
  storage_alcove: { flag: 'torch_lit', script: 'darkness_death' },
};
