import { getLocaleDirection, normalizeLocaleTag, type Direction } from '../rtl/direction';

export type WeekInfo = {
  firstDay: number;
  weekend: number[];
  minimalDays: number;
};

export type LocaleCapabilities = {
  locale: string;
  language: string;
  script?: string;
  region?: string;
  direction: Direction;
  calendars: string[];
  collations: string[];
  numberingSystems: string[];
  hourCycles: string[];
  timeZones: string[];
  weekInfo?: WeekInfo;
};

export type IntlSupportedValueKey =
  | 'calendar'
  | 'collation'
  | 'currency'
  | 'numberingSystem'
  | 'timeZone'
  | 'unit';

type LocaleInfoMethods = Intl.Locale & {
  getCalendars?: () => string[];
  getCollations?: () => string[];
  getNumberingSystems?: () => string[];
  getHourCycles?: () => string[];
  getTimeZones?: () => string[] | undefined;
  getWeekInfo?: () => WeekInfo;
  readonly calendars?: string[];
  readonly collations?: string[];
  readonly numberingSystems?: string[];
  readonly hourCycles?: string[];
  readonly timeZones?: string[];
  readonly weekInfo?: WeekInfo;
};

type ArrayGetter =
  | 'getCalendars'
  | 'getCollations'
  | 'getNumberingSystems'
  | 'getHourCycles'
  | 'getTimeZones';

type ArrayProperty =
  | 'calendars'
  | 'collations'
  | 'numberingSystems'
  | 'hourCycles'
  | 'timeZones';

function readArray(locale: LocaleInfoMethods, getter: ArrayGetter, property: ArrayProperty): string[] {
  try {
    const method = locale[getter];
    const values = typeof method === 'function' ? method.call(locale) : locale[property];
    return Array.isArray(values) ? [...values] : [];
  } catch {
    return [];
  }
}

function readWeekInfo(locale: LocaleInfoMethods): WeekInfo | undefined {
  try {
    const method = locale.getWeekInfo;
    const value = typeof method === 'function' ? method.call(locale) : locale.weekInfo;
    if (!value) return undefined;
    if (!Number.isInteger(value.firstDay) || !Number.isInteger(value.minimalDays) || !Array.isArray(value.weekend)) {
      return undefined;
    }
    return {
      firstDay: value.firstDay,
      weekend: [...value.weekend],
      minimalDays: value.minimalDays,
    };
  } catch {
    return undefined;
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
    collations: readArray(parsed, 'getCollations', 'collations'),
    numberingSystems: readArray(parsed, 'getNumberingSystems', 'numberingSystems'),
    hourCycles: readArray(parsed, 'getHourCycles', 'hourCycles'),
    timeZones: readArray(parsed, 'getTimeZones', 'timeZones'),
  };
  const script = parsed.script ?? maximized.script;
  const region = parsed.region ?? maximized.region;
  const weekInfo = readWeekInfo(parsed);
  if (script) result.script = script;
  if (region) result.region = region;
  if (weekInfo) result.weekInfo = weekInfo;
  return result;
}

/**
 * Return canonical values exposed by Intl.supportedValuesOf when available.
 * The helper fails explicitly rather than shipping a stale private registry.
 */
export function supportedIntlValues(key: IntlSupportedValueKey): string[] {
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (valueKey: IntlSupportedValueKey) => string[];
  };
  if (typeof intl.supportedValuesOf !== 'function') {
    throw new Error('Intl.supportedValuesOf is not supported by this runtime.');
  }
  return [...intl.supportedValuesOf(key)];
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
