export type Direction = 'ltr' | 'rtl';

/**
 * ISO 15924 script subtags whose horizontal writing direction is right-to-left.
 * Keep this list script-based: languages can be written in multiple scripts with
 * different directions (for example az-Arab vs az-Latn).
 */
const RTL_SCRIPTS = new Set([
  'Adlm', // Adlam
  'Arab', // Arabic
  'Gara', // Garay
  'Hebr', // Hebrew
  'Rohg', // Hanifi Rohingya
  'Mand', // Mandaic
  'Mend', // Mende Kikakui
  'Nkoo', // N'Ko
  'Hung', // Old Hungarian
  'Samr', // Samaritan
  'Syrc', // Syriac
  'Thaa', // Thaana
  'Yezi', // Yezidi
]);

const RTL_LETTER_SCRIPT = /[\p{Script=Adlam}\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Hanifi_Rohingya}\p{Script=Mandaic}\p{Script=Mende_Kikakui}\p{Script=Nko}\p{Script=Old_Hungarian}\p{Script=Samaritan}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Yezidi}\u{10D4A}-\u{10D65}\u{10D6F}-\u{10D85}]/u;
const LETTER = /\p{Letter}/u;
const RTL_DIRECTIONAL_MARK = /[\u061C\u200F]/u;
const LTR_DIRECTIONAL_MARK = /\u200E/u;

/**
 * Lightweight first-strong direction inference for short UI values. Digits,
 * combining marks, and neutral punctuation are skipped rather than being
 * classified from their script alone. Explicit ALM/RLM/LRM marks are honored.
 */
export function getTextDirection(text: string, fallback: Direction = 'ltr'): Direction {
  for (const char of text) {
    if (RTL_DIRECTIONAL_MARK.test(char)) return 'rtl';
    if (LTR_DIRECTIONAL_MARK.test(char)) return 'ltr';
    if (!LETTER.test(char)) continue;
    return RTL_LETTER_SCRIPT.test(char) ? 'rtl' : 'ltr';
  }
  return fallback;
}

export function normalizeLocaleTag(locale: string): string {
  const value = locale.trim();
  if (!value) throw new RangeError('Locale must not be empty.');
  const [canonical] = Intl.getCanonicalLocales(value.replaceAll('_', '-'));
  if (!canonical) throw new RangeError(`Invalid locale: ${locale}`);
  return canonical;
}

/**
 * Resolve direction from the locale's effective script, never from language
 * alone. Intl.Locale#maximize supplies the likely script when one is omitted.
 */
type LocaleTextInfo = { direction?: string };
type LocaleWithTextInfo = Intl.Locale & {
  getTextInfo?: () => LocaleTextInfo;
  readonly textInfo?: LocaleTextInfo;
};

function directionFromLocaleInfo(locale: Intl.Locale): Direction | undefined {
  const candidate = locale as LocaleWithTextInfo;
  try {
    const info = typeof candidate.getTextInfo === 'function'
      ? candidate.getTextInfo()
      : candidate.textInfo;
    return info?.direction === 'rtl' || info?.direction === 'ltr' ? info.direction : undefined;
  } catch {
    return undefined;
  }
}

export function getLocaleDirection(locale: string, fallback: Direction = 'ltr'): Direction {
  try {
    const parsed = new Intl.Locale(normalizeLocaleTag(locale));

    // Prefer ECMA-402 Locale Info when available. Current engines expose
    // getTextInfo(); some older engines shipped the equivalent textInfo accessor.
    // This delegates script metadata to the platform/CLDR and automatically
    // understands newly added scripts such as Garay when the runtime does.
    const platformDirection = directionFromLocaleInfo(parsed);
    if (platformDirection) return platformDirection;

    // Compatibility fallback for engines without Locale Info.
    const script = parsed.script ?? parsed.maximize().script;
    if (!script) return fallback;
    return RTL_SCRIPTS.has(script) ? 'rtl' : 'ltr';
  } catch {
    return fallback;
  }
}

export function dirAttributes(locale: string): { lang: string; dir: Direction } {
  const lang = normalizeLocaleTag(locale);
  return { lang, dir: getLocaleDirection(lang) };
}
