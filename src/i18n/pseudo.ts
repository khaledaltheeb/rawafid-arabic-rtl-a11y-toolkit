const ACCENT_MAP: Readonly<Record<string, string>> = Object.freeze({
  a: 'à', b: 'ƀ', c: 'ç', d: 'đ', e: 'ë', f: 'ƒ', g: 'ğ', h: 'ħ', i: 'ï', j: 'ĵ',
  k: 'ķ', l: 'ľ', m: 'ɱ', n: 'ñ', o: 'ô', p: 'þ', q: 'ɋ', r: 'ř', s: 'š', t: 'ŧ',
  u: 'ü', v: 'ṽ', w: 'ŵ', x: 'ẋ', y: 'ÿ', z: 'ž',
  A: 'À', B: 'Ƀ', C: 'Ç', D: 'Đ', E: 'Ë', F: 'Ƒ', G: 'Ğ', H: 'Ħ', I: 'Ï', J: 'Ĵ',
  K: 'Ķ', L: 'Ľ', M: 'Ṁ', N: 'Ñ', O: 'Ô', P: 'Þ', Q: 'Ɋ', R: 'Ř', S: 'Š', T: 'Ŧ',
  U: 'Ü', V: 'Ṽ', W: 'Ŵ', X: 'Ẋ', Y: 'Ÿ', Z: 'Ž',
});

const TOKEN = /(\{[^{}]+\}|%\d*\$?[a-zA-Z]|<[^<>]+>|&[A-Za-z0-9#]+;)/gu;
const LETTER_OR_NUMBER = /[\p{Letter}\p{Number}]/u;

export type PseudoLocalizeOptions = {
  expansionRatio?: number;
  prefix?: string;
  suffix?: string;
  preserveTokens?: boolean;
};

function transformChunk(chunk: string, expansionRatio: number): string {
  let result = '';
  let expansionCredit = 0;

  for (const char of chunk) {
    const mapped = ACCENT_MAP[char] ?? char;
    result += mapped;
    if (!LETTER_OR_NUMBER.test(char) || expansionRatio === 0) continue;

    expansionCredit += expansionRatio;
    while (expansionCredit >= 1) {
      result += mapped;
      expansionCredit -= 1;
    }
  }
  return result;
}

/**
 * Pseudo-localize UI copy for truncation/layout testing while preserving common
 * interpolation/markup tokens by default. This is a QA helper, not translation.
 */
export function pseudoLocalize(value: string, options: PseudoLocalizeOptions = {}): string {
  const {
    expansionRatio = 0.35,
    prefix = '[!! ',
    suffix = ' !!]',
    preserveTokens = true,
  } = options;

  if (!Number.isFinite(expansionRatio) || expansionRatio < 0 || expansionRatio > 5) {
    throw new RangeError('expansionRatio must be between 0 and 5.');
  }

  if (!preserveTokens) return `${prefix}${transformChunk(value, expansionRatio)}${suffix}`;

  let result = '';
  let offset = 0;
  for (const match of value.matchAll(TOKEN)) {
    const index = match.index;
    result += transformChunk(value.slice(offset, index), expansionRatio);
    result += match[0];
    offset = index + match[0].length;
  }
  result += transformChunk(value.slice(offset), expansionRatio);
  return `${prefix}${result}${suffix}`;
}
