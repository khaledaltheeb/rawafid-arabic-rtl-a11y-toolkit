# Roadmap

The roadmap prioritizes standards correctness, reusable engineering value, interoperability evidence, and conservative public API design over feature count.

## 0.2 - Hardened foundation (completed)

- Script-aware direction across modern RTL script families.
- Bidi control/isolation safety helpers.
- Script-safe locale negotiation and `Intl` formatting.
- Conservative Arabic text/search helpers.
- Direction-aware keyboard navigation.
- SSR-safe accessibility primitives.
- Logical CSS utilities.
- Cross-browser Playwright + axe matrix.
- Package-shape validation.
- CodeQL, Dependency Review, OpenSSF Scorecard, SHA-pinned workflow gate.
- OIDC/provenance release design.
- Threat model, compatibility contract, quality gates, and scope guard.

## 0.3 - Global platform and interoperability (current)

Completed or in active verification:

- Grapheme-safe segmentation, slicing, and truncation.
- Pseudo-localization for layout and localization QA.
- Runtime locale capability introspection.
- Unicode display-risk diagnostics without destructive normalization or exaggerated UTS #39 claims.
- Roving-tabindex/composite navigation state with RTL and disabled-item support.
- Mixed-script form, table, breadcrumb, and composite-widget browser fixtures.
- Built-package browser verification across Chromium, Firefox, WebKit, and mobile Chromium.
- Integration contract for framework-neutral consumption.

Remaining in this phase:

- Additional dialog/disclosure/menu reference fixtures where the generic behavior can be modeled without pretending to own application semantics.
- Stable RTL/LTR comparison fixtures suitable for visual-regression providers.
- Translation-service workflow examples only after a legitimate provider integration is available.
- Optional BrowserStack/TestMu CI adapters only after program approval and without embedding provider credentials.

## 0.4 - Internationalization depth (in progress)

Completed:

- Locale-aware word and sentence segmentation helpers on `Intl.Segmenter` with explicit host-runtime boundaries.
- Plural-category and display-name helpers with ECMA-402 variability contracts.
- Structured number/date/list/relative-time `formatToParts` wrappers.
- Runtime-derived localized decimal-input parsing, including locale digits, separators, signs, grouping validation, and bidi literals.
- Decimal digit-system interoperability for Latin, Arabic-Indic, and Extended Arabic-Indic digits without destructive punctuation normalization.
- Cross-module tests spanning Arabic plural behavior, segmentation, locale capabilities, digit systems, localized-number roundtrips, and script-safe locale behavior.

Remaining:

- Deeper locale-extension and fallback property tests where behavior can be specified independently of ICU/CLDR version details.
- Additional script-direction conformance fixtures, including mixed-script identifiers and newly standardized scripts as platform support evolves.
- Optional Unicode security data integration only if licensing, update automation, package size, and conformance claims can be handled correctly.

## 0.5 - Optional adapters and reference packages

- Thin optional framework adapters only when they reduce repeated integration code materially.
- Keep React/Next.js/Vue/Svelte/etc. dependencies out of the core package.
- Accessible reference patterns for pagination, roving tabindex, disclosure, tabs, and direction-aware navigation.
- Consider separate packages rather than widening the core API when framework lifecycle behavior is required.

## 0.6 - Ecosystem and institutional maturity

- Public package publication with provenance after npm scope/bootstrap requirements are satisfied.
- Reproducible release artifacts and SBOM history.
- Issue/PR templates exercised by real external contributions.
- Provider-backed OSS infrastructure only where eligibility is verified.
- Maintain an evidence-backed OSS application dossier whose provider criteria are re-checked before submissions.
- Public compatibility evidence spanning supported Node and browser generations.
- Documented deprecation/migration process exercised before 1.0.

## 1.0 - Stable API

- Public API frozen under SemVer after sustained 0.x field use.
- Sustained browser/runtime compatibility evidence.
- Public release/provenance history.
- Security and dependency processes operating successfully over time.
- Maintainer/reviewer process operating successfully with external contributions.
- No unresolved ambiguity between the Rawafid platform identity, official website, source repository, and npm package.
