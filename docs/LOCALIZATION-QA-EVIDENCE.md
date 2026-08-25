# Localization QA evidence contract

The toolkit publishes a vendor-neutral, machine-readable localization QA contract in `qa/localization-contract.json` and generates `partner-results/localization-qa.json` from the committed locale catalogs.

## Why this exists

Localization quality is not only a linguistic concern. Translation workflows can accidentally remove placeholders, alter structural markup, introduce legacy bidi overrides, or leave Unicode directional isolates unbalanced. These failures are particularly costly in Arabic/RTL interfaces because the resulting defect may appear only with runtime substitution or mixed-direction content.

The project already validates basic catalog parity. This evidence layer makes the checks externally consumable and adds RTL-specific structural signals.

## Error-level checks

- reference key parity;
- non-empty messages;
- named placeholder **multiset** parity, including duplicate occurrence counts;
- conservative HTML-like markup token parity;
- rejection of legacy Unicode bidi embedding/override controls;
- balanced LRI/RLI/FSI and PDI isolate structure.

## Informational checks

Zero-width characters are reported for contextual review but are not rejected automatically. ZWNJ and ZWJ can be linguistically legitimate in Arabic-script languages, so their presence is evidence for review rather than a maliciousness or translation-error verdict.

## Machine-readable output

`npm run localization:evidence` writes `partner-results/localization-qa.json` containing:

- contract identity;
- reference locale;
- locale and key counts;
- number of active checks;
- pass/fail summary;
- structured findings with severity, check ID, locale and key;
- explicit non-claim boundaries.

CI runs the evidence generator in the quality lanes and again before the browser interoperability suite, then retains the result in `partner-interoperability-evidence`.

## Standards and platform relationship

The design is informed by localization-platform placeholder/tag integrity checks and Unicode MessageFormat guidance around bidirectional isolation. It remains provider-neutral: no Transifex, Weblate, or other platform account is required and no provider certification is claimed.

## Evidence boundary

This contract does not score translation fluency, terminology accuracy, cultural appropriateness, or complete HTML safety. Markup parity is deliberately conservative rather than a sanitizer, and linguistic review remains necessary for real product content.
