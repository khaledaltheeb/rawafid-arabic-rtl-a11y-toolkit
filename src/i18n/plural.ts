export type PluralType = 'cardinal' | 'ordinal';

export type PluralSelectionOptions = Intl.PluralRulesOptions;

/** Select the CLDR-backed plural category exposed by the host Intl implementation. */
export function selectPluralCategory(
  value: number,
  locale: string,
  options: PluralSelectionOptions = {},
): Intl.LDMLPluralRule {
  if (!Number.isFinite(value)) throw new RangeError('Plural value must be finite.');
  return new Intl.PluralRules(locale, options).select(value);
}

/** Select a plural category for a numeric range when the host supports selectRange(). */
export function selectPluralRangeCategory(
  start: number,
  end: number,
  locale: string,
  options: PluralSelectionOptions = {},
): Intl.LDMLPluralRule {
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new RangeError('Plural range values must be finite.');
  }

  const rules = new Intl.PluralRules(locale, options) as Intl.PluralRules & {
    selectRange?: (rangeStart: number, rangeEnd: number) => Intl.LDMLPluralRule;
  };
  if (typeof rules.selectRange !== 'function') {
    throw new Error('Intl.PluralRules.prototype.selectRange is not supported by this runtime.');
  }
  return rules.selectRange(start, end);
}

/** Return the runtime-resolved locale/options for auditing and deterministic UI policy. */
export function resolvePluralRules(
  locale: string,
  options: PluralSelectionOptions = {},
): Intl.ResolvedPluralRulesOptions {
  return new Intl.PluralRules(locale, options).resolvedOptions();
}
