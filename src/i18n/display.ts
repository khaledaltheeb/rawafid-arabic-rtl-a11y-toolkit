export type DisplayNameCodeType = Intl.DisplayNamesOptions['type'];

export type DisplayNameOptions = Intl.DisplayNamesOptions;

/**
 * Format language, region, script, currency, calendar, or date-time field codes
 * through Intl.DisplayNames. Returns undefined when the runtime has no name and
 * fallback is configured as "none".
 */
export function formatDisplayName(
  code: string,
  locale: string,
  options: DisplayNameOptions,
): string | undefined {
  return new Intl.DisplayNames(locale, options).of(code);
}

/** Format many display-name codes without constructing a formatter per item. */
export function formatDisplayNames(
  codes: readonly string[],
  locale: string,
  options: DisplayNameOptions,
): Array<string | undefined> {
  const formatter = new Intl.DisplayNames(locale, options);
  return codes.map((code) => formatter.of(code));
}

export function resolveDisplayNames(
  locale: string,
  options: DisplayNameOptions,
): Intl.ResolvedDisplayNamesOptions {
  return new Intl.DisplayNames(locale, options).resolvedOptions();
}
