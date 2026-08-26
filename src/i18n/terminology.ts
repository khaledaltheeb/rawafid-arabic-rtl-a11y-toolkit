import type { MessageCatalog } from './catalog';

export type TerminologySeverity = 'info' | 'warning' | 'error';
export type TerminologyMatchMode = 'any' | 'all';
export type TerminologyFindingKind = 'forbidden-target' | 'missing-required-target';

export type TerminologyPattern =
  | string
  | Readonly<{
      value: string;
      caseSensitive?: boolean;
      wholeWord?: boolean;
    }>;

export type TerminologyRule = Readonly<{
  id: string;
  sourceTerms?: readonly TerminologyPattern[];
  sourceMatch?: TerminologyMatchMode;
  forbiddenTargetTerms?: readonly TerminologyPattern[];
  requiredTargetTerms?: readonly TerminologyPattern[];
  requiredTargetMatch?: TerminologyMatchMode;
  severity?: TerminologySeverity;
  message?: string;
  tags?: readonly string[];
}>;

export type TerminologyProfile = Readonly<{
  id: string;
  version: string;
  sourceLocale?: string;
  targetLocale?: string;
  rules: readonly TerminologyRule[];
}>;

export type TranslationUnit = Readonly<{
  source: string;
  target: string;
  key?: string;
  sourceLocale?: string;
  targetLocale?: string;
}>;

export type TerminologyFinding = Readonly<{
  profileId: string;
  profileVersion: string;
  ruleId: string;
  kind: TerminologyFindingKind;
  severity: TerminologySeverity;
  source: string;
  target: string;
  matchedSourceTerms: readonly string[];
  matchedTargetTerms: readonly string[];
  missingTargetTerms: readonly string[];
  key?: string;
  sourceLocale?: string;
  targetLocale?: string;
  message?: string;
  tags?: readonly string[];
}>;

export type TerminologyProfileIssue = Readonly<{
  path: string;
  message: string;
}>;

export type TerminologySummary = Readonly<{
  total: number;
  error: number;
  warning: number;
  info: number;
  byRule: Readonly<Record<string, number>>;
}>;

export type CatalogTerminologyOptions = Readonly<{
  sourceLocale?: string;
  targetLocale?: string;
}>;

function patternValue(pattern: TerminologyPattern): string {
  return typeof pattern === 'string' ? pattern : pattern.value;
}

function normalizeForMatch(value: string, caseSensitive: boolean): string {
  const normalized = value.normalize('NFC');
  return caseSensitive ? normalized : normalized.toLocaleLowerCase('und');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesPattern(text: string, pattern: TerminologyPattern): boolean {
  const value = patternValue(pattern);
  if (value.length === 0) return false;

  const caseSensitive = typeof pattern === 'string' ? false : (pattern.caseSensitive ?? false);
  const wholeWord = typeof pattern === 'string' ? false : (pattern.wholeWord ?? false);
  const normalizedText = normalizeForMatch(text, caseSensitive);
  const normalizedValue = normalizeForMatch(value, caseSensitive);

  if (!wholeWord) return normalizedText.includes(normalizedValue);

  const flags = caseSensitive ? 'u' : 'iu';
  const expression = `(?<![\\p{L}\\p{N}\\p{M}_])${escapeRegExp(normalizedValue)}(?![\\p{L}\\p{N}\\p{M}_])`;
  return new RegExp(expression, flags).test(normalizedText);
}

function matchedValues(text: string, patterns: readonly TerminologyPattern[] | undefined): string[] {
  if (!patterns || patterns.length === 0) return [];
  return patterns.filter((pattern) => matchesPattern(text, pattern)).map(patternValue);
}

function sourceRuleApplies(source: string, rule: TerminologyRule): { applies: boolean; matches: string[] } {
  const terms = rule.sourceTerms;
  if (!terms || terms.length === 0) return { applies: true, matches: [] };

  const matches = matchedValues(source, terms);
  const mode = rule.sourceMatch ?? 'any';
  return {
    applies: mode === 'all' ? matches.length === terms.length : matches.length > 0,
    matches,
  };
}

function normalizeLocale(locale: string): string {
  try {
    return new Intl.Locale(locale).toString().toLocaleLowerCase('en-US');
  } catch {
    return locale.trim().replace(/_/gu, '-').toLocaleLowerCase('en-US');
  }
}

function localeCompatible(actual: string | undefined, expected: string | undefined): boolean {
  if (!actual || !expected) return true;
  const normalizedActual = normalizeLocale(actual);
  const normalizedExpected = normalizeLocale(expected);
  return normalizedActual === normalizedExpected || normalizedActual.startsWith(`${normalizedExpected}-`);
}

function unitMatchesProfile(unit: TranslationUnit, profile: TerminologyProfile): boolean {
  return (
    localeCompatible(unit.sourceLocale, profile.sourceLocale) &&
    localeCompatible(unit.targetLocale, profile.targetLocale)
  );
}

function findingBase(
  unit: TranslationUnit,
  profile: TerminologyProfile,
  rule: TerminologyRule,
  matchedSourceTerms: readonly string[],
): Omit<TerminologyFinding, 'kind' | 'matchedTargetTerms' | 'missingTargetTerms'> {
  return {
    profileId: profile.id,
    profileVersion: profile.version,
    ruleId: rule.id,
    severity: rule.severity ?? 'warning',
    source: unit.source,
    target: unit.target,
    matchedSourceTerms,
    ...(unit.key === undefined ? {} : { key: unit.key }),
    ...((unit.sourceLocale ?? profile.sourceLocale) === undefined
      ? {}
      : { sourceLocale: unit.sourceLocale ?? profile.sourceLocale }),
    ...((unit.targetLocale ?? profile.targetLocale) === undefined
      ? {}
      : { targetLocale: unit.targetLocale ?? profile.targetLocale }),
    ...(rule.message === undefined ? {} : { message: rule.message }),
    ...(rule.tags === undefined ? {} : { tags: rule.tags }),
  };
}

/**
 * Deterministically audit one source/target translation unit against a literal
 * terminology profile. The engine does not infer semantic equivalence: rules
 * must state the source triggers and target constraints explicitly.
 */
export function auditTranslationTerminology(
  unit: TranslationUnit,
  profile: TerminologyProfile,
): TerminologyFinding[] {
  if (!unitMatchesProfile(unit, profile)) return [];

  const findings: TerminologyFinding[] = [];

  for (const rule of profile.rules) {
    const sourceState = sourceRuleApplies(unit.source, rule);
    if (!sourceState.applies) continue;

    const forbiddenMatches = matchedValues(unit.target, rule.forbiddenTargetTerms);
    if (forbiddenMatches.length > 0) {
      findings.push({
        ...findingBase(unit, profile, rule, sourceState.matches),
        kind: 'forbidden-target',
        matchedTargetTerms: forbiddenMatches,
        missingTargetTerms: [],
      });
    }

    const required = rule.requiredTargetTerms;
    if (required && required.length > 0) {
      const requiredMatches = matchedValues(unit.target, required);
      const requiredMode = rule.requiredTargetMatch ?? 'any';
      const requirementMet =
        requiredMode === 'all' ? requiredMatches.length === required.length : requiredMatches.length > 0;

      if (!requirementMet) {
        const matchedSet = new Set(requiredMatches);
        findings.push({
          ...findingBase(unit, profile, rule, sourceState.matches),
          kind: 'missing-required-target',
          matchedTargetTerms: requiredMatches,
          missingTargetTerms: required.map(patternValue).filter((value) => !matchedSet.has(value)),
        });
      }
    }
  }

  return findings;
}

/** Audit matching keys from a source catalog and translated target catalog. */
export function auditCatalogTerminology(
  sourceCatalog: MessageCatalog,
  targetCatalog: MessageCatalog,
  profile: TerminologyProfile,
  options: CatalogTerminologyOptions = {},
): TerminologyFinding[] {
  const findings: TerminologyFinding[] = [];
  const sourceLocale = options.sourceLocale ?? profile.sourceLocale;
  const targetLocale = options.targetLocale ?? profile.targetLocale;

  for (const [key, source] of Object.entries(sourceCatalog)) {
    const target = targetCatalog[key];
    if (target === undefined) continue;

    findings.push(
      ...auditTranslationTerminology(
        {
          source,
          target,
          key,
          ...(sourceLocale === undefined ? {} : { sourceLocale }),
          ...(targetLocale === undefined ? {} : { targetLocale }),
        },
        profile,
      ),
    );
  }

  return findings;
}

/** Validate a serializable terminology profile before it is used in CI or tooling. */
export function validateTerminologyProfile(profile: TerminologyProfile): TerminologyProfileIssue[] {
  const issues: TerminologyProfileIssue[] = [];
  const ids = new Set<string>();

  if (profile.id.trim().length === 0) issues.push({ path: 'id', message: 'Profile id must not be empty.' });
  if (profile.version.trim().length === 0) {
    issues.push({ path: 'version', message: 'Profile version must not be empty.' });
  }

  profile.rules.forEach((rule, index) => {
    const base = `rules[${index}]`;
    if (rule.id.trim().length === 0) issues.push({ path: `${base}.id`, message: 'Rule id must not be empty.' });
    if (ids.has(rule.id)) issues.push({ path: `${base}.id`, message: `Duplicate rule id: ${rule.id}` });
    ids.add(rule.id);

    const targetCount = (rule.forbiddenTargetTerms?.length ?? 0) + (rule.requiredTargetTerms?.length ?? 0);
    if (targetCount === 0) {
      issues.push({
        path: base,
        message: 'Rule must define at least one forbiddenTargetTerms or requiredTargetTerms entry.',
      });
    }

    const collections: readonly [string, readonly TerminologyPattern[] | undefined][] = [
      ['sourceTerms', rule.sourceTerms],
      ['forbiddenTargetTerms', rule.forbiddenTargetTerms],
      ['requiredTargetTerms', rule.requiredTargetTerms],
    ];

    for (const [name, patterns] of collections) {
      patterns?.forEach((pattern, patternIndex) => {
        if (patternValue(pattern).trim().length === 0) {
          issues.push({
            path: `${base}.${name}[${patternIndex}]`,
            message: 'Terminology pattern must not be empty.',
          });
        }
      });
    }
  });

  return issues;
}

export function summarizeTerminologyFindings(findings: readonly TerminologyFinding[]): TerminologySummary {
  const byRule: Record<string, number> = {};
  let error = 0;
  let warning = 0;
  let info = 0;

  for (const finding of findings) {
    byRule[finding.ruleId] = (byRule[finding.ruleId] ?? 0) + 1;
    if (finding.severity === 'error') error += 1;
    else if (finding.severity === 'warning') warning += 1;
    else info += 1;
  }

  return { total: findings.length, error, warning, info, byRule };
}
