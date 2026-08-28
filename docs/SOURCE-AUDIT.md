# Rawafid Arabic/RTL Source Audit

The Rawafid source audit is a zero-runtime-dependency command-line gate for defects that are easy to miss in generic accessibility and localization pipelines: bidirectional-control hazards, document-direction metadata, direction-physical CSS, and selected mixed-direction authoring risks.

It complements rather than replaces axe-core, browser testing, localization review, assistive-technology testing, or human Arabic-language review.

## Why this exists

Arabic and other RTL-script products fail in ways that are not reducible to visual mirroring. Common production defects include:

- a document declaring an Arabic locale without declaring its RTL base direction;
- CSS tied to physical left/right edges that silently breaks when the same component is rendered in another writing direction;
- `unicode-bidi` overrides or Unicode directional controls that change display order in surprising or security-sensitive ways;
- free-form user content rendered without an isolation/direction strategy;
- application code that passes generic WCAG automation while still behaving incorrectly in mixed Arabic/Latin identifiers, forms, tables, breadcrumbs, or design-system primitives.

The audit makes a conservative subset of these defects machine-detectable and CI-friendly.

## CLI

After package publication, the package binary is exposed as `rawafid-rtl-audit`. From a repository checkout it can also be invoked directly:

```bash
node ./bin/rawafid-rtl-audit.mjs src styles
```

Useful modes:

```bash
# Human-readable audit. Error-level rules fail CI.
rawafid-rtl-audit . --strict

# Treat warnings as blocking for new code.
rawafid-rtl-audit . --strict --fail-on warning

# Machine-readable output.
rawafid-rtl-audit . --format json --fail-on none

# SARIF 2.1.0 for code-scanning systems.
rawafid-rtl-audit . --format sarif --out rawafid-rtl.sarif --fail-on none
```

The scanner ignores common generated/dependency directories such as `.git`, `node_modules`, `dist`, `build`, `coverage`, and `.next`. Individual path fragments can be excluded explicitly with repeatable `--exclude` arguments. Files larger than 2 MB are skipped and the default traversal limit is 10,000 supported text files; the limit can be changed deliberately with `--max-files`.

## Brownfield adoption and baselines

An enterprise codebase should not have to fix every historical RTL defect before it can prevent new ones. Rawafid therefore supports a reviewed baseline:

```bash
rawafid-rtl-audit . \
  --strict \
  --write-baseline .rawafid-rtl-baseline.json \
  --fail-on none
```

Commit the reviewed baseline, then gate subsequent work:

```bash
rawafid-rtl-audit . \
  --strict \
  --baseline .rawafid-rtl-baseline.json \
  --fail-on warning
```

A baseline entry is keyed by file, rule, and evidence line. Existing findings remain measurable as `suppressed`; a newly introduced finding is active and can fail CI. Teams can shrink the baseline over time instead of normalizing permanent exceptions.

A baseline is not an approval certificate. It is migration state and should receive code review like any other policy file.

## SARIF / GitHub Code Scanning example

The CLI emits SARIF 2.1.0. A repository with GitHub code-scanning permissions can upload it using the standard SARIF upload action:

```yaml
- name: Rawafid Arabic/RTL audit
  run: >-
    node ./bin/rawafid-rtl-audit.mjs .
    --strict
    --baseline .rawafid-rtl-baseline.json
    --format sarif
    --out rawafid-rtl.sarif
    --fail-on none

- name: Upload Rawafid SARIF
  uses: github/codeql-action/upload-sarif@<reviewed-full-commit-sha>
  with:
    sarif_file: rawafid-rtl.sarif

- name: Enforce new RTL findings
  run: >-
    node ./bin/rawafid-rtl-audit.mjs .
    --strict
    --baseline .rawafid-rtl-baseline.json
    --fail-on warning
```

The example intentionally does not publish a floating third-party Action tag. This repository's supply-chain policy requires reviewed full commit SHAs for Actions.

## Rule families

### Bidi controls

| Rule | Default significance | Purpose |
| --- | --- | --- |
| `RAWAFID-BIDI-001` | error | Finds Unicode LRO/RLO overrides in source. |
| `RAWAFID-BIDI-002` | warning | Finds legacy bidi embedding controls in new source. |
| `RAWAFID-BIDI-003` | error | Finds unmatched Unicode isolate openers/PDI. |
| `RAWAFID-BIDI-004` | error/warning | Finds escaped bidi controls that become active at runtime. |

These are display/source-risk diagnostics, not a claim of complete Unicode security analysis or full UTS #39 confusable detection.

### Document and markup direction

| Rule | Default significance | Purpose |
| --- | --- | --- |
| `RAWAFID-HTML-001` | error | Requires primary language metadata for HTML documents. |
| `RAWAFID-HTML-002` | warning | Detects an RTL-script document locale without an explicit RTL base direction. |
| `RAWAFID-HTML-003` | error | Detects a static `lang`/`dir` script-direction contradiction. |
| `RAWAFID-HTML-004` | error | Rejects invalid static `dir` values. |
| `RAWAFID-HTML-005` | error | Requires explicit direction on the order-overriding `bdo` element. |
| `RAWAFID-HTML-006` | note, strict mode | Flags free-form text controls for review of `dir="auto"`/direction submission strategy. |

The parser intentionally evaluates conservative static forms. It does not execute templates or guess the runtime result of dynamic JSX/Vue/Svelte expressions.

### CSS and utility classes

| Rule | Default significance | Purpose |
| --- | --- | --- |
| `RAWAFID-CSS-001` | warning | Maps direction-physical horizontal declarations to the corresponding CSS logical property. |
| `RAWAFID-CSS-002` | warning | Flags `text-align:left/right` when `start/end` may be direction-safe. |
| `RAWAFID-CSS-003` | warning | Prompts review when CSS `direction` is used instead of semantic HTML direction. |
| `RAWAFID-CSS-004` | error/warning | Flags `unicode-bidi` override/embed behavior for explicit review. |
| `RAWAFID-CSS-005` | warning | Flags physical `float`/`clear` values. |
| `RAWAFID-UTILITY-001` | note, strict mode | Finds selected physical left/right utility-class patterns where logical utilities may exist. |

A physical property is not inherently wrong. Maps, media controls, charts, coordinate systems, and intentionally physical affordances can legitimately remain physical. Findings therefore include a remediation condition rather than blindly rewriting source.

## CI exit contract

- `0`: no finding meets the configured failure threshold.
- `1`: one or more active findings meet the configured failure threshold.
- `2`: configuration, traversal, parsing of the baseline, or another tool execution error occurred.

`--fail-on error` is the default. `--fail-on warning` is suitable for organizations that have established a clean or baselined codebase. `--fail-on none` is useful for reporting-only/SARIF-generation stages.

## Relationship to WCAG and accessibility automation

Rawafid does **not** claim that passing this audit makes a product WCAG 2.2 conformant, EN 301 549 conformant, European Accessibility Act compliant, linguistically correct, or usable with every assistive technology. Automated checks cannot prove those outcomes.

A mature Arabic/RTL release pipeline should combine at least:

1. semantic and WCAG automation such as axe-core;
2. Rawafid source audit for direction/bidi/logical-layout hazards;
3. deterministic LTR/RTL browser fixtures and screenshot comparisons where visual invariants matter;
4. keyboard and focus-flow tests for direction-aware composite widgets;
5. native-speaker localization review for the actual target locale and domain terminology;
6. targeted screen-reader/manual accessibility verification for critical user journeys;
7. real-device/browser testing when the supported environment requires it.

## Standards posture

Rules are grounded narrowly in relevant platform behavior and guidance, including:

- Unicode Bidirectional Algorithm (UAX #9);
- Unicode security considerations where applicable, without claiming complete UTS #39 implementation;
- HTML `dir`, `bdi`, `bdo`, `lang`, and direction semantics;
- W3C Internationalization guidance for bidirectional content and user-generated text;
- BCP 47 script-aware locale tags;
- CSS Logical Properties and writing-mode-aware layout;
- WCAG 2.2 language-of-page requirements where the rule directly maps to them.

Each rule is intentionally smaller than the standard it references. Standards references explain the engineering rationale; they are not compliance certifications.

## Design constraints

The audit follows the same boundaries as the core toolkit:

- zero runtime dependencies;
- no network calls during scanning;
- no source mutation or auto-fix by default;
- deterministic output for the same files/runtime;
- conservative static detection instead of executing untrusted project code;
- no collection or transmission of scanned source;
- SARIF/JSON output suitable for existing enterprise systems;
- brownfield migration without hiding the quantity of suppressed legacy findings.

These constraints are deliberate: a source scanner intended for security-sensitive and enterprise repositories should be inspectable, offline-capable, predictable, and easy to remove or replace.
