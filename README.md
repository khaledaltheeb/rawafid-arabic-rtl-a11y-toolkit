# Rawafid Arabic/RTL Accessibility & Localization Toolkit

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/badge)](https://scorecard.dev/viewer/?uri=github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit)

A framework-agnostic, zero-runtime-dependency TypeScript engineering toolkit for Arabic and bidirectional web applications: script-aware direction, Unicode bidi safety, locale negotiation, pluralization, structured formatting, locale-sensitive segmentation, display names, grapheme-safe text, pseudo-localization, locale capability inspection, accessibility interaction state, logical CSS, Unicode display-risk diagnostics, and real-browser RTL verification.

## Rawafid identity

**Rawafid (روافد)** is the platform name. Its official production website is **https://healthrenewal.org/**. The domain name is not the product name.

This GitHub repository is the source repository for the reusable **Rawafid Arabic/RTL Accessibility & Localization Toolkit**. It is an independent open-source engineering component associated with Rawafid; it is not the production website and does not contain the Rawafid scientific/content corpus.

See [docs/PROJECT-IDENTITY.md](./docs/PROJECT-IDENTITY.md) for the canonical identity and link policy.

> **Public-scope guarantee:** this repository contains general-purpose software only. It intentionally excludes Rawafid encyclopedia entries, scientific/editorial content, assessments, datasets, user data, production secrets, and proprietary publishing/SEO logic. See [OPEN_SOURCE_SCOPE.md](./OPEN_SOURCE_SCOPE.md).

## Engineering position

Arabic support is not a mirror transform. Correct multilingual RTL software requires explicit language/direction metadata, isolation of mixed-direction values, script-aware locale handling, logical layout properties, direction-aware interaction models, Unicode-safe string boundaries, locale-sensitive formatting and plural rules, accessibility semantics, and browser-level verification.

The toolkit keeps those concerns separate enough to reuse and integrated enough to test as one engineering layer.

### Standards baseline

The project tracks web-platform standards rather than inventing Rawafid-specific locale or direction rules:

- W3C WCAG 2.2 for accessibility requirements and evaluation context.
- WAI-ARIA Authoring Practices as interaction-pattern guidance, without claiming automatic pattern conformance.
- W3C Internationalization guidance for language and direction metadata.
- Unicode Bidirectional Algorithm concepts and Unicode 17-era script handling.
- Unicode security concepts for defensive diagnostics, without claiming full UTS #39 confusable conformance.
- BCP 47 locale tags through `Intl.Locale`.
- ECMA-402 / platform `Intl` APIs for locale data, segmentation, pluralization, display names, formatting, and collation.
- CSS logical properties for direction-independent layout.

Alignment with standards does **not** constitute automatic WCAG conformance, security certification, or linguistic correctness for every locale. See [docs/STANDARDS.md](./docs/STANDARDS.md) and [docs/GLOBAL-PLATFORM.md](./docs/GLOBAL-PLATFORM.md).

## Capability map

### RTL and bidi

- `getLocaleDirection()` resolves direction from the locale's **effective script**, not the language name alone.
- Modern RTL script coverage including Arabic, Hebrew, Adlam, Garay, Hanifi Rohingya, Mandaic, Mende Kikakui, N'Ko, Old Hungarian, Samaritan, Syriac, Thaana, and Yezidi.
- First-strong text direction detection for mixed content.
- Unicode isolate helpers (`LRI`, `RLI`, `FSI`, `PDI`).
- Detection/removal helpers for explicit bidi controls and legacy embedding/override controls.
- Logical-to-physical side mapping for direction-aware UI logic.

### Localization / i18n

- Locale canonicalization through platform `Intl`.
- Script-safe locale negotiation: `az-Arab` does not silently fall back to `az-Latn`.
- Deterministic locale fallback chains.
- Number, date, list, relative-time, sorting, and search-collation wrappers.
- Structured `formatToParts` APIs for numbers, dates, lists, and relative time so localized output can be rendered semantically without English-centric parsing.
- `Intl.PluralRules` category selection for cardinal and ordinal behavior, including Arabic's richer category system.
- Runtime-gated plural-range category selection through the native platform capability.
- `Intl.DisplayNames` wrappers for standardized locale-sensitive names of supported languages, scripts, regions, currencies, calendars, and fields.
- Translation catalog QA for key parity, placeholder parity, empty messages, and legacy bidi controls.
- Runtime locale capability inspection for effective script/region/direction and platform-exposed calendars, numbering systems, and hour cycles.
- Pseudo-localization for clipping, expansion, token-preservation, and layout QA.

### Unicode and Arabic text

- Arabic-script detection and Unicode-property-based combining-mark handling.
- Conservative Arabic search/display normalization without aggressive letter conflation.
- Grapheme-safe segmentation, length, slicing, and truncation via `Intl.Segmenter`.
- Locale-sensitive word segmentation with `isWordLike` metadata and word-only extraction.
- Locale-sensitive sentence segmentation without claiming semantic or grammatical parsing.
- Locale-aware highlight segmentation that returns structured text rather than HTML.
- Unicode display-risk diagnostics for bidi controls/overrides, isolate imbalance, selected zero-width characters, and mixed recognized scripts.

### Accessibility and UI interaction

- RTL-aware horizontal and vertical keyboard navigation.
- Roving-focus/roving-tabindex state with disabled-item handling.
- Focus discovery/restoration with hidden/inert subtree handling.
- SSR-safe ARIA live-region announcements.
- Direction-neutral pagination state models.
- Screen-reader-only, focus, skip-link, forced-colors, and reduced-motion CSS utilities.

### Verification and supply chain

- Vitest unit suite, including Arabic plural and multilingual segmentation coverage.
- Playwright matrix: Chromium, Firefox, WebKit, and mobile Chromium.
- Controlled mixed-direction browser fixture with forms, breadcrumb, table, composite tabs, live regions, and QA helpers.
- axe-core automated accessibility regression checks.
- GitHub Actions tests on Node 22, 24, and 26.
- CodeQL, Dependency Review, and OpenSSF Scorecard workflows.
- GitHub Actions pinned to full commit SHAs.
- `publint` and Are The Types Wrong package validation.
- npm Trusted Publishing/OIDC release design with provenance and SPDX SBOM generation after bootstrap publication requirements are satisfied.
- Open-source scope guard and secret-like material checks.
- GitLab CI and non-root Docker test environment.

## Installation

After the first npm publication:

```bash
npm install @rawafid/arabic-rtl-a11y-toolkit
```

Before publication, clone the repository and build it locally.

## Quick start

```ts
import {
  bidiIsolate,
  diagnoseUnicodeDisplay,
  dirAttributes,
  formatDisplayName,
  formatNumberParts,
  getLocaleCapabilities,
  nextRovingFocusIndex,
  pseudoLocalize,
  selectBestLocale,
  selectPluralCategory,
  truncateGraphemes,
  words,
} from '@rawafid/arabic-rtl-a11y-toolkit';

const root = dirAttributes('ar-JO');
// { lang: 'ar-JO', dir: 'rtl' }

const transliteratedArabic = dirAttributes('ar-Latn');
// { lang: 'ar-Latn', dir: 'ltr' }

const isolatedAccount = bidiIsolate('support@example.org');
const locale = selectBestLocale(['az-Arab'], ['az-Latn', 'en'], 'en');
// 'en' — same-language fallback never crosses script boundaries silently.

const capabilities = getLocaleCapabilities('ar-JO');
const clipped = truncateGraphemes('A👨‍👩‍👧‍👦ب', 2);
// 'A…' — the family emoji is never split.

const arabicWords = words('مرحبا بالعالم، أهلاً بك.', 'ar');
const plural = selectPluralCategory(3, 'ar');
// 'few' with the runtime's Arabic plural data.

const languageName = formatDisplayName('ar', 'en', { type: 'language' });
const numberParts = formatNumberParts(12500.5, 'ar-JO');
// Structured localized parts can be rendered without reparsing formatted text.

const pseudo = pseudoLocalize('Hello {name}');
// Keeps {name} intact while transforming/expanding surrounding test copy.

const diagnostic = diagnoseUnicodeDisplay('abcمرحبا');
// Includes 'mixed-script' as a review signal, not a malware verdict.

const nextTab = nextRovingFocusIndex(2, 5, 'ArrowRight', {
  direction: 'rtl',
  disabled: [false, true, false, false, false],
});
```

CSS utilities are separate entry points:

```css
@import '@rawafid/arabic-rtl-a11y-toolkit/styles/logical.css';
@import '@rawafid/arabic-rtl-a11y-toolkit/styles/a11y.css';
```

## Integration rules

1. Put valid `lang` and `dir` metadata on the document root.
2. Do not infer direction from a language subtag when the effective script can differ.
3. Prefer `<bdi>` or Unicode isolates for unknown/mixed-direction inline values such as emails, usernames, versions, and identifiers.
4. Give intrinsically LTR editable values an explicit `dir="ltr"` where appropriate.
5. Prefer CSS logical properties to `left`/`right` assumptions.
6. Keep DOM order, reading order, visual order, and focus order coherent.
7. Preserve `formatToParts()` order; never reconstruct localized output from English separator/order assumptions.
8. Branch on plural categories returned by `Intl.PluralRules`, not hand-written per-language arithmetic in application code.
9. Mirror only icons whose meaning is genuinely directional.
10. Treat Unicode diagnostics as policy signals, not proof of safety or maliciousness.
11. Treat roving-focus functions as state helpers; consuming components still own semantic HTML, ARIA, focus calls, labels, and pattern-specific behavior.
12. Treat pseudo-localization as QA output, never as human translation.

See [docs/INTEROPERABILITY.md](./docs/INTEROPERABILITY.md) for framework and application-boundary guidance.

## Development

Requirements: supported Node.js 22 or 24. Node 26 is continuously tested as the forward-compatibility lane.

```bash
npm install
npm run check
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

The package has zero runtime dependencies. Development dependencies are exact-versioned and the committed lockfile is authoritative for CI. See [docs/DEPENDENCY-BOOTSTRAP.md](./docs/DEPENDENCY-BOOTSTRAP.md).

## Quality model

| Layer | Gate |
| --- | --- |
| Public scope | `npm run scope:check` |
| Workflow supply chain | `npm run supply-chain:check` |
| Translation catalogs | `npm run catalogs:check` |
| Static quality | ESLint + strict TypeScript |
| Logic | Vitest |
| Package shape | tsdown + publint + Are The Types Wrong |
| Browsers | Playwright: Chromium / Firefox / WebKit / mobile |
| Automated accessibility | axe-core |
| Security analysis | CodeQL + Dependency Review |
| OSS posture | OpenSSF Scorecard |
| Release identity | npm Trusted Publishing + OIDC provenance after bootstrap |

See [docs/QUALITY-GATES.md](./docs/QUALITY-GATES.md), [docs/TEST-MATRIX.md](./docs/TEST-MATRIX.md), and [docs/VERIFICATION-STATUS.md](./docs/VERIFICATION-STATUS.md).

## Security model

Bidi controls, Unicode format characters, localization files, dependency changes, and CI workflows are treated as security-sensitive surfaces. The project deliberately avoids HTML-generating localization/highlight helpers and distinguishes display-risk diagnostics from full Unicode security conformance.

- [SECURITY.md](./SECURITY.md)
- [docs/THREAT-MODEL.md](./docs/THREAT-MODEL.md)
- [docs/REPOSITORY-SETTINGS.md](./docs/REPOSITORY-SETTINGS.md)

## Architecture, API, and compatibility

- [docs/GLOBAL-PLATFORM.md](./docs/GLOBAL-PLATFORM.md)
- [docs/API-CONTRACT.md](./docs/API-CONTRACT.md)
- [docs/INTEROPERABILITY.md](./docs/INTEROPERABILITY.md)
- [docs/COMPATIBILITY.md](./docs/COMPATIBILITY.md)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/STANDARDS.md](./docs/STANDARDS.md)
- [ROADMAP.md](./ROADMAP.md)

Pre-1.0 releases may refine APIs, but breaking changes still require explicit changelog entries and migration notes.

## Open-source program readiness

The repository is structured to provide legitimate engineering evidence for OSS programs: public reusable code, an OSI license, cross-browser test need, localization workflows, accessibility testing, public governance, security controls, and clear separation from Rawafid's scientific corpus. Where an application asks for the official platform website, use **https://healthrenewal.org/**; where it asks for source code, use this repository.

Acceptance by BrowserStack, Transifex, Sentry, Weblate, JetBrains, Docker, GitLab, TestMu, or any other provider remains entirely subject to the provider's current rules. See [docs/OSS-PROGRAM-READINESS.md](./docs/OSS-PROGRAM-READINESS.md).

## Contributing

Contributions are welcome when they are reusable beyond Rawafid and stay inside the public scope. Every behavior change should include tests and a standards/compatibility rationale where relevant.

See [CONTRIBUTING.md](./CONTRIBUTING.md), [GOVERNANCE.md](./GOVERNANCE.md), and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

Apache License 2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
