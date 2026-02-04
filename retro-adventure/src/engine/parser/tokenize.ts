import { noiseWords } from './synonyms';

/**
 * Normalize input string: lowercase, trim, collapse spaces
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

/**
 * Tokenize input into words, filtering noise words
 */
export function tokenize(input: string): string[] {
  const normalized = normalize(input);
  const tokens = normalized.split(' ').filter(Boolean);

  // Keep first token (verb) and filter noise from the rest
  if (tokens.length <= 1) return tokens;

  const verb = tokens[0];
  const rest = tokens.slice(1).filter(t => !noiseWords.includes(t));

  return [verb, ...rest];
}

/**
 * Extract preposition-separated parts
 * "use key on door" -> { before: "key", prep: "on", after: "door" }
 */
export function extractParts(tokens: string[]): {
  verb: string;
  object: string;
  preposition?: string;
  target?: string;
} {
  const preps = ['on', 'with', 'to', 'at', 'in'];

  const verb = tokens[0] || '';
  const rest = tokens.slice(1);

  // Find preposition index
  let prepIndex = -1;
  let foundPrep = '';
  for (const prep of preps) {
    const idx = rest.indexOf(prep);
    if (idx !== -1) {
      prepIndex = idx;
      foundPrep = prep;
      break;
    }
  }

  if (prepIndex === -1) {
    return {
      verb,
      object: rest.join(' '),
    };
  }

  return {
    verb,
    object: rest.slice(0, prepIndex).join(' '),
    preposition: foundPrep,
    target: rest.slice(prepIndex + 1).join(' '),
  };
}
