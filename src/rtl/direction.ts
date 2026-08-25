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
const CANONICAL_SCRIPT_SUBTAG = /^[A-Z][a-z]{3}$/u;

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
 * Return an explicitly supplied ISO 15924 script from a canonical BCP 47 tag.
 * Explicit script metadata is authoritative: a runtime's likely-subtag or
 * Locale Info data must never override `az-Arab`, `az-Latn`, `ar-Latn`, etc.
 */
function explicitScriptFromCanonicalLocale(canonical: string): string | undefined {
  const subtags = canonical.split('-');
  for (let index = 1; index < subtags.length; index += 1) {
    const subtag = subtags[index];
    if (CANONICAL_SCRIPT_SUBTAG.test(subtag)) return subtag;
  }
  return undefined;
}

/**
 * Resolve direction from the locale's effective script, never from language
 * alone. Explicit BCP 47 script metadata wins. Intl.Locale#maximize supplies
 * the likely script only when one is omitted.
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
    const canonical = normalizeLocaleTag(locale);
    const explicitScript = explicitScriptFromCanonicalLocale(canonical);
    if (explicitScript) return RTL_SCRIPTS.has(explicitScript) ? 'rtl' : 'ltr';

    const parsed = new Intl.Locale(canonical);

    // Locale Info is useful only when the caller did not provide an explicit
    // script. Some engines derive direction from the language's default script,
    // which must not override an explicit BCP 47 script subtag.
    const platformDirection = directionFromLocaleInfo(parsed);
    if (platformDirection) return platformDirection;

    // Compatibility fallback for engines without Locale Info.
    const script = parsed.maximize().script;
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
