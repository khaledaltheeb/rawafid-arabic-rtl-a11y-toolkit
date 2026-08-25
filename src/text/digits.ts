export type DecimalDigitSystem = 'latn' | 'arab' | 'arabext';

export type DigitSystemReport = {
  systems: readonly DecimalDigitSystem[];
  counts: Readonly<Record<DecimalDigitSystem, number>>;
  digitCount: number;
  mixed: boolean;
};

const SYSTEM_ORDER: readonly DecimalDigitSystem[] = ['latn', 'arab', 'arabext'];

const SYSTEM_BASE: Readonly<Record<DecimalDigitSystem, number>> = {
  latn: 0x0030,
  arab: 0x0660,
  arabext: 0x06f0,
};

type DigitInfo = {
  system: DecimalDigitSystem;
  value: number;
};

function digitInfo(character: string): DigitInfo | undefined {
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined) return undefined;

  for (const system of SYSTEM_ORDER) {
    const base = SYSTEM_BASE[system];
    if (codePoint >= base && codePoint <= base + 9) {
      return { system, value: codePoint - base };
    }
  }

  return undefined;
}

/**
 * Inspect the three decimal digit systems most relevant to Arabic-script web
 * applications without changing the source string.
 *
 * The returned system identifiers intentionally match ECMA-402 / Unicode
 * numbering-system identifiers: `latn`, `arab`, and `arabext`.
 */
export function detectDigitSystems(text: string): DigitSystemReport {
  const counts: Record<DecimalDigitSystem, number> = {
    latn: 0,
    arab: 0,
    arabext: 0,
  };

  let digitCount = 0;
  for (const character of text) {
    const info = digitInfo(character);
    if (!info) continue;
    counts[info.system] += 1;
    digitCount += 1;
  }

  const systems = SYSTEM_ORDER.filter((system) => counts[system] > 0);
  return {
    systems,
    counts,
    digitCount,
    mixed: systems.length > 1,
  };
}

export function containsMixedDigitSystems(text: string): boolean {
  return detectDigitSystems(text).mixed;
}

/**
 * Convert recognized decimal digit characters while preserving every
 * non-digit code point exactly as supplied. Separators, signs, punctuation,
 * identifiers, and surrounding text are intentionally not interpreted.
 */
export function convertDigits(text: string, targetSystem: DecimalDigitSystem): string {
  const base = SYSTEM_BASE[targetSystem];
  let output = '';

  for (const character of text) {
    const info = digitInfo(character);
    output += info ? String.fromCodePoint(base + info.value) : character;
  }

  return output;
}

/**
 * Search-key normalization only. The display/source string should be retained
 * separately when original digit presentation matters.
 */
export function normalizeDigitsForSearch(text: string): string {
  return convertDigits(text, 'latn');
}
