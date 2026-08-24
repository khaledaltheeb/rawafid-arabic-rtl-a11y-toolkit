import { getLocaleDirection, normalizeLocaleTag, type Direction } from '../rtl/direction';

export type LocaleCapabilities = {
  locale: string;
  language: string;
  script?: string;
  region?: string;
  direction: Direction;
  calendars: string[];
  numberingSystems: string[];
  hourCycles: string[];
};

type LocaleInfoMethods = Intl.Locale & {
  getCalendars?: () => string[];
  getNumberingSystems?: () => string[];
  getHourCycles?: () => string[];
  readonly calendars?: string[];
  readonly numberingSystems?: string[];
  readonly hourCycles?: string[];
};

function readArray(
  locale: LocaleInfoMethods,
  getter: 'getCalendars' | 'getNumberingSystems' | 'getHourCycles',
  property: 'calendars' | 'numberingSystems' | 'hourCycles',
): string[] {
  try {
    const method = locale[getter];
    const values = typeof method === 'function' ? method.call(locale) : locale[property];
    return Array.isArray(values) ? [...values] : [];
  } catch {
    return [];
  }
}

/** Query locale metadata from ECMA-402/CLDR when the running engine exposes it. */
export function getLocaleCapabilities(locale: string): LocaleCapabilities {
  const canonical = normalizeLocaleTag(locale);
  const parsed = new Intl.Locale(canonical) as LocaleInfoMethods;
  const maximized = parsed.maximize();
  const result: LocaleCapabilities = {
    locale: canonical,
    language: parsed.language,
    direction: getLocaleDirection(canonical),
    calendars: readArray(parsed, 'getCalendars', 'calendars'),
    numberingSystems: readArray(parsed, 'getNumberingSystems', 'numberingSystems'),
    hourCycles: readArray(parsed, 'getHourCycles', 'hourCycles'),
  };
  const script = parsed.script ?? maximized.script;
  const region = parsed.region ?? maximized.region;
  if (script) result.script = script;
  if (region) result.region = region;
  return result;
}

export function supportsLocale(locale: string, constructors: readonly ('number' | 'date' | 'collator')[] = ['number', 'date', 'collator']): boolean {
  let canonical: string;
  try {
    canonical = normalizeLocaleTag(locale);
  } catch {
    return false;
  }

  return constructors.every((kind) => {
    if (kind === 'number') return Intl.NumberFormat.supportedLocalesOf([canonical]).length === 1;
    if (kind === 'date') return Intl.DateTimeFormat.supportedLocalesOf([canonical]).length === 1;
    return Intl.Collator.supportedLocalesOf([canonical]).length === 1;
  });
}
