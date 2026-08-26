import { normalizeLocaleTag } from '../rtl/direction';

type LocaleInfo = {
  canonical: string;
  key: string;
  language: string;
  script?: string;
  region?: string;
};

function localeInfo(locale: string): LocaleInfo {
  const canonical = normalizeLocaleTag(locale);
  const parsed = new Intl.Locale(canonical);
  const maximized = parsed.maximize();
  const result: LocaleInfo = {
    canonical,
    key: canonical.toLowerCase(),
    language: parsed.language.toLowerCase(),
  };
  const script = parsed.script ?? maximized.script;
  const region = parsed.region ?? maximized.region;
  if (script) result.script = script;
  if (region) result.region = region;
  return result;
}

export function localeFallbackChain(locale: string, defaultLocale?: string): string[] {
  const canonical = normalizeLocaleTag(locale);
  const parsed = new Intl.Locale(canonical);
  const candidates = new Set<string>();

  candidates.add(canonical);
  if (parsed.language && parsed.script && parsed.region) {
    candidates.add(`${parsed.language}-${parsed.script}`);
    candidates.add(`${parsed.language}-${parsed.region}`);
  } else if (parsed.language && parsed.script) {
    candidates.add(`${parsed.language}-${parsed.script}`);
  } else if (parsed.language && parsed.region) {
    candidates.add(`${parsed.language}-${parsed.region}`);
  }
  if (parsed.language) candidates.add(parsed.language);
  if (defaultLocale) candidates.add(normalizeLocaleTag(defaultLocale));

  return [...candidates];
}

/**
 * Negotiate a locale without crossing script boundaries. A request for an
 * Arabic-script locale must not silently select a Latin-script translation of
 * the same language merely because the language subtag matches.
 */
export function selectBestLocale(
  requested: readonly string[],
  available: readonly string[],
  defaultLocale?: string,
): string | undefined {
  if (available.length === 0) return undefined;

  const availableInfo = available.map(localeInfo);
  const byKey = new Map(availableInfo.map((item) => [item.key, item] as const));

  for (const requestedLocale of requested) {
    const requestedInfo = localeInfo(requestedLocale);
    const exact = byKey.get(requestedInfo.key);
    if (exact) return exact.canonical;

    const sameLanguageAndScript = availableInfo.filter(
      (item) => item.language === requestedInfo.language && item.script === requestedInfo.script,
    );

    if (sameLanguageAndScript.length > 0) {
      const sameRegion = sameLanguageAndScript.find((item) => item.region === requestedInfo.region);
      return (sameRegion ?? sameLanguageAndScript[0])?.canonical;
    }
  }

  if (defaultLocale) {
    const defaultInfo = localeInfo(defaultLocale);
    const exactDefault = byKey.get(defaultInfo.key);
    if (exactDefault) return exactDefault.canonical;

    const compatibleDefaults = availableInfo.filter(
      (item) => item.language === defaultInfo.language && item.script === defaultInfo.script,
    );
    if (compatibleDefaults.length > 0) {
      const sameRegion = compatibleDefaults.find((item) => item.region === defaultInfo.region);
      return (sameRegion ?? compatibleDefaults[0])?.canonical;
    }
  }

  return availableInfo[0]?.canonical;
}
