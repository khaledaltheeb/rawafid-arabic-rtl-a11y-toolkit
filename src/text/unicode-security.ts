import { BIDI, containsBidiControls, hasUnsafeBidiOverrides } from '../rtl/bidi';

export type UnicodeDisplayRisk =
  | 'bidi-control'
  | 'bidi-override'
  | 'unbalanced-isolate'
  | 'zero-width'
  | 'mixed-script';

export type UnicodeDisplayDiagnostic = {
  risks: UnicodeDisplayRisk[];
  hasBidiControls: boolean;
  hasUnsafeBidiOverrides: boolean;
  hasUnbalancedIsolates: boolean;
  hasZeroWidthCharacters: boolean;
  scripts: string[];
};

const ZERO_WIDTH_CODE_POINTS = new Set([0x200b, 0x200c, 0x200d, 0x2060, 0xfeff]);
const LETTER = /\p{Letter}/u;

const SCRIPT_TESTS: ReadonlyArray<readonly [string, RegExp]> = [
  ['Arabic', /\p{Script=Arabic}/u],
  ['Hebrew', /\p{Script=Hebrew}/u],
  ['Latin', /\p{Script=Latin}/u],
  ['Cyrillic', /\p{Script=Cyrillic}/u],
  ['Greek', /\p{Script=Greek}/u],
  ['Devanagari', /\p{Script=Devanagari}/u],
  ['Han', /\p{Script=Han}/u],
  ['Hiragana', /\p{Script=Hiragana}/u],
  ['Katakana', /\p{Script=Katakana}/u],
] as const;

function hasZeroWidthCharacters(value: string): boolean {
  for (const char of value) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined && ZERO_WIDTH_CODE_POINTS.has(codePoint)) return true;
  }
  return false;
}

function isolateBalance(value: string): boolean {
  let depth = 0;
  for (const char of value) {
    if (char === BIDI.LRI || char === BIDI.RLI || char === BIDI.FSI) depth += 1;
    if (char === BIDI.PDI) {
      if (depth === 0) return false;
      depth -= 1;
    }
  }
  return depth === 0;
}

/**
 * Return script families represented by letters in a string. Common and
 * Inherited characters are intentionally ignored.
 */
export function detectLetterScripts(value: string): string[] {
  const scripts = new Set<string>();
  for (const char of value) {
    if (!LETTER.test(char)) continue;
    for (const [name, pattern] of SCRIPT_TESTS) {
      if (pattern.test(char)) {
        scripts.add(name);
        break;
      }
    }
  }
  return [...scripts];
}

/**
 * Defense-in-depth diagnostics for suspicious display features in untrusted
 * identifiers or labels. This is deliberately not advertised as full UTS #39
 * confusable detection or source-code Trojan Source analysis.
 */
export function diagnoseUnicodeDisplay(value: string): UnicodeDisplayDiagnostic {
  const scripts = detectLetterScripts(value);
  const bidi = containsBidiControls(value);
  const unsafeBidi = hasUnsafeBidiOverrides(value);
  const balanced = isolateBalance(value);
  const zeroWidth = hasZeroWidthCharacters(value);
  const risks: UnicodeDisplayRisk[] = [];

  if (bidi) risks.push('bidi-control');
  if (unsafeBidi) risks.push('bidi-override');
  if (!balanced) risks.push('unbalanced-isolate');
  if (zeroWidth) risks.push('zero-width');
  if (scripts.length > 1) risks.push('mixed-script');

  return {
    risks,
    hasBidiControls: bidi,
    hasUnsafeBidiOverrides: unsafeBidi,
    hasUnbalancedIsolates: !balanced,
    hasZeroWidthCharacters: zeroWidth,
    scripts,
  };
}
