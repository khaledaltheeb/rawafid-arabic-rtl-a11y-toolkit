# Terminology QA

The terminology QA layer is a deterministic, profile-driven check for multilingual localization pipelines. It is designed for CI, translation-catalog review, and institutional terminology governance where a source concept has an explicitly reviewed target-language constraint.

It is **not** a machine translator, semantic-equivalence engine, medical/legal decision system, or general translation-quality scorer.

## Design goals

- Zero runtime dependencies.
- Serializable profiles suitable for code review and version control.
- Explicit source triggers to reduce unrelated target-text false positives.
- Required and forbidden target terms with `any` or `all` matching semantics.
- Unicode-normalized literal matching with optional whole-word boundaries.
- Locale boundaries so an Arabic profile cannot silently evaluate an unrelated language pair.
- Stable, machine-readable findings for CI, SARIF adapters, dashboards, or human review.
- No bundled organization-specific scientific, legal, safeguarding, health, or policy glossary.

## Basic example

```ts
import {
  auditTranslationTerminology,
  type TerminologyProfile,
} from '@rawafid/arabic-rtl-a11y-toolkit';

const profile: TerminologyProfile = {
  id: 'example-arabic-profile',
  version: '1.0.0',
  sourceLocale: 'en',
  targetLocale: 'ar',
  rules: [
    {
      id: 'reviewed-term',
      sourceTerms: ['grooming'],
      forbiddenTargetTerms: ['مصطلح غير معتمد'],
      requiredTargetTerms: ['المصطلح المعتمد'],
      severity: 'error',
    },
  ],
};

const findings = auditTranslationTerminology(
  {
    source: 'Guidance on grooming risks.',
    target: 'إرشادات تستخدم مصطلح غير معتمد.',
    sourceLocale: 'en-GB',
    targetLocale: 'ar-JO',
  },
  profile,
);
```

A rule can emit both a `forbidden-target` finding and a `missing-required-target` finding. Keeping those conditions distinct is useful when one fix must remove a deprecated term and add a reviewed replacement.

## Source-conditioned rules

A terminology rule is evaluated only when its source condition applies. With `sourceMatch: 'any'` (the default), at least one configured source term must match. With `sourceMatch: 'all'`, every configured source term must match.

If a rule omits `sourceTerms`, it is unconditional. Unconditional rules should be used carefully because they apply to every translation unit evaluated by the profile.

## Required-target semantics

`requiredTargetTerms` uses `requiredTargetMatch: 'any'` by default. This is appropriate when several reviewed target variants are acceptable.

Use `requiredTargetMatch: 'all'` for compound concepts whose reviewed translation must preserve every required component.

## Whole-word matching

String patterns use substring matching by default. Structured patterns can request Unicode-aware whole-word behavior:

```ts
{
  value: 'scan',
  wholeWord: true,
  caseSensitive: false,
}
```

The boundary definition excludes Unicode letters, numbers, combining marks, and underscore on either side. This is a lexical safety mechanism, not a language-specific morphological analyzer.

## Locale boundaries

Profiles may declare `sourceLocale` and `targetLocale`. A unit tagged with a different language is skipped. Regional subtags remain compatible with a language-level profile, so `ar-JO` may be evaluated by a profile targeting `ar`.

This boundary is intentionally conservative. It does not claim dialect equivalence or linguistic interchangeability.

## Catalog auditing

`auditCatalogTerminology` evaluates keys available in both source and target catalogs and preserves the message key in each finding. Missing-key detection belongs to the existing catalog QA layer rather than this terminology engine, so responsibilities remain composable and independently testable.

## Profile validation

`validateTerminologyProfile` detects structural defects such as:

- empty profile identifiers or versions;
- empty or duplicate rule identifiers;
- rules with no target constraint;
- empty terminology patterns.

Passing validation does **not** establish that terminology is scientifically, legally, culturally, or linguistically correct. Institutional profiles require qualified human review and provenance appropriate to their domain.

## Findings and reporting

Findings include:

- profile id/version;
- rule id;
- kind and severity;
- source and target strings;
- matched source terms;
- matched or missing target terms;
- optional catalog key and locales;
- optional rule message and tags.

`summarizeTerminologyFindings` provides deterministic totals by severity and rule. It is deliberately presentation-neutral so consumers can render console output, JSON reports, dashboards, or other formats without coupling the core package to a specific CI provider.

## Institutional use and scope boundary

The open-source engine is intentionally generic. An organization may maintain its own reviewed terminology profile separately and use the engine to enforce it. Examples include accessibility vocabularies, public-sector terminology, safeguarding terminology, product language, or legal/compliance terminology.

Organization-specific controlled vocabularies should not be added to the public toolkit unless their provenance, licensing, governance, and general-purpose reuse are independently appropriate for Apache-2.0 distribution.

This separation allows the public package to remain reusable while organizations retain ownership and governance of their internal or licensed language assets.

## Security and privacy

The core functions are pure string/profile evaluation and do not make network requests or persist input. Applications remain responsible for deciding whether source/target text may be processed in their environment, especially when localization data contains confidential or sensitive material.
