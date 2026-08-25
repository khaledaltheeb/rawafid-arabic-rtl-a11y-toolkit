import { normalizeDigitsForSearch } from './digits';

/** Marks whose Script_Extensions includes Arabic, across current Unicode blocks. */
const ARABIC_DIACRITICS = /(?=\p{Script_Extensions=Arabic})\p{Mark}/gu;
const TATWEEL = /\u0640/gu;
const ALEF_VARIANTS = /[\u0622\u0623\u0625\u0671]/gu;
const ARABIC_SCRIPT = /\p{Script=Arabic}/u;

export type ArabicNormalizationOptions = {
  stripDiacritics?: boolean;
  stripTatweel?: boolean;
  normalizeAlef?: boolean;
  normalizeAlefMaksura?: boolean;
};

export function hasArabicScript(text: string): boolean {
  return ARABIC_SCRIPT.test(text);
}

export function stripArabicDiacritics(text: string): string {
  return text.normalize('NFC').replace(ARABIC_DIACRITICS, '');
}

/**
 * Conservative normalization for search/display keys. It deliberately does
 * not conflate letters such as ة/ه or ؤ/و because those substitutions can
 * destroy lexical distinctions. Applications needing linguistic analysis
 * should use a domain-specific morphology/tokenization library instead.
 */
export function normalizeArabicText(
  text: string,
  options: ArabicNormalizationOptions = {},
): string {
  const {
    stripDiacritics = true,
    stripTatweel = true,
    normalizeAlef = true,
    normalizeAlefMaksura = false,
  } = options;

  let output = text.normalize('NFC');
  if (stripDiacritics) output = output.replace(ARABIC_DIACRITICS, '');
  if (stripTatweel) output = output.replace(TATWEEL, '');
  if (normalizeAlef) output = output.replace(ALEF_VARIANTS, 'ا');
  if (normalizeAlefMaksura) output = output.replace(/ى/gu, 'ي');
  return output;
}

export function createArabicSearchKey(text: string): string {
  return normalizeDigitsForSearch(
    normalizeArabicText(text, { normalizeAlefMaksura: true }),
  )
    .toLocaleLowerCase('ar')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function compareArabic(a: string, b: string, locale = 'ar'): number {
  return new Intl.Collator(locale, { usage: 'sort', sensitivity: 'base', numeric: true }).compare(a, b);
}
