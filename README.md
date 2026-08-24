# Rawafid Arabic/RTL Accessibility & Localization Toolkit

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/badge)](https://scorecard.dev/viewer/?uri=github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit)

A framework-agnostic TypeScript toolkit for Arabic and right-to-left web engineering: script-aware directionality, Unicode bidi safety, localization primitives, conservative Arabic text utilities, accessibility helpers, logical CSS, direction-aware UI behavior, and real-browser RTL tests.

## Rawafid identity

**Rawafid (روافد)** is the platform name. Its official production website is **https://healthrenewal.org/**. The domain name is not the product name.

This GitHub repository is the source repository for the reusable **Rawafid Arabic/RTL Accessibility & Localization Toolkit**. It is an independent open-source engineering component associated with Rawafid; it is not the production website and does not contain the Rawafid scientific/content corpus.

See [docs/PROJECT-IDENTITY.md](./docs/PROJECT-IDENTITY.md) for the canonical identity and link policy.

> **Public-scope guarantee:** this repository contains general-purpose software only. It intentionally excludes Rawafid encyclopedia entries, scientific/editorial content, assessments, datasets, user data, production secrets, and proprietary publishing logic. See [OPEN_SOURCE_SCOPE.md](./OPEN_SOURCE_SCOPE.md).

## Engineering position

Arabic support is not a mirror transform. Correct RTL software requires explicit direction metadata, isolation of mixed-direction strings, script-aware locale handling, logical layout properties, direction-aware interaction models, locale-sensitive formatting, accessibility semantics, and browser-level verification.

The toolkit is designed around those concerns and keeps the runtime core dependency-free.

### Standards baseline

The project tracks relevant web platform standards rather than inventing a Rawafid-specific direction model:

- W3C WCAG 2.2 for accessibility requirements and testing context.
- W3C Internationalization guidance for language and direction metadata.
- Unicode Bidirectional Algorithm concepts and Unicode 17-era script handling.
- BCP 47 locale tags through `Intl.Locale`.
- ECMA-402 / platform `Intl` APIs for locale-sensitive formatting and collation.
- CSS logical properties for direction-independent layout.

Alignment with standards does **not** constitute automatic WCAG conformance or accessibility certification. Automated tools cover only part of accessibility evaluation. See [docs/STANDARDS.md](./docs/STANDARDS.md).

## What is included

### RTL and bidi

- `getLocaleDirection()` resolves direction from the locale's **effective script**, not from the language name alone.
- Coverage for modern RTL script subtags including Arabic, Hebrew, Adlam, Garay, Hanifi Rohingya, Mandaic, Mende Kikakui, N'Ko, Old Hungarian, Samaritan, Syriac, Thaana, and Yezidi.
- First-strong text direction detection for mixed content.
- Unicode isolate helpers (`LRI`, `RLI`, `FSI`, `PDI`).
- Detection/removal helpers for explicit bidi controls and legacy embedding/override controls.
- Logical-to-physical side mapping for direction-aware UI logic.

### Localization / i18n

- Locale canonicalization through `Intl.getCanonicalLocales`.
- Script-safe locale negotiation: `az-Arab` does not silently fall back to `az-Latn`.
- Deterministic locale fallback chains.
- `Intl` wrappers for numbers, dates, lists, relative time, sorting, and search collation.
- Translation catalog QA for key parity, placeholder parity, empty messages, and legacy bidi controls.

### Arabic text utilities

- Arabic-script detection.
- Unicode-property-based Arabic mark removal.
- Conservative search/display normalization.
- Optional Alef Maksura normalization.
- No aggressive conflation of distinct letters such as `ة` and `ه`.
- Locale-aware highlight segmentation that returns structured text rather than HTML.

### Accessibility and UI

- RTL-aware horizontal keyboard navigation.
- Focus discovery/restoration with hidden/inert subtree handling.
- SSR-safe ARIA live-region announcements.
- Direction-neutral pagination state models.
- Screen-reader-only, focus, skip-link, forced-colors, and reduced-motion CSS utilities.

### Verification and supply-chain controls

- Vitest unit suite.
- Playwright matrix: Chromium, Firefox, WebKit, and mobile Chromium.
- axe-core browser accessibility checks.
- GitHub Actions tests on Node 22, 24, and 26.
- CodeQL, Dependency Review, and OpenSSF Scorecard workflows.
- GitHub Actions pinned to full commit SHAs.
- `publint` and Are The Types Wrong package validation.
- npm Trusted Publishing/OIDC release workflow with provenance and SPDX SBOM generation.
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
  createArabicSearchKey,
  dirAttributes,
  formatNumber,
  getPaginationModel,
  nextIndexFromKey,
  selectBestLocale,
} from '@rawafid/arabic-rtl-a11y-toolkit';

const root = dirAttributes('ar-JO');
// { lang: 'ar-JO', dir: 'rtl' }

const transliteratedArabic = dirAttributes('ar-Latn');
// { lang: 'ar-Latn', dir: 'ltr' }

const isolatedAccount = bidiIsolate('support@example.org');
const total = formatNumber(12500, 'ar-JO');
const searchKey = createArabicSearchKey('إِلَى المدرسة');
const pages = getPaginationModel(5, 20);
const nextTab = nextIndexFromKey(2, 6, 'ArrowRight', { direction: 'rtl' });
const locale = selectBestLocale(['az-Arab'], ['az-Latn', 'en'], 'en');
// 'en' — the library does not cross script boundaries silently.
```

CSS utilities are separate entry points:

```css
@import '@rawafid/arabic-rtl-a11y-toolkit/styles/logical.css';
@import '@rawafid/arabic-rtl-a11y-toolkit/styles/a11y.css';
```

## Direction rules

1. Put valid `lang` and `dir` metadata on the document root.
2. Do not infer direction from the language subtag when the script can differ.
3. Prefer HTML direction metadata and `<bdi>`/Unicode isolates for mixed-direction values.
4. Prefer CSS logical properties to `left`/`right` assumptions.
5. Keep DOM order, reading order, visual order, and focus order coherent.
6. Mirror only icons whose meaning is genuinely directional.
7. Treat untrusted bidi controls as a security-sensitive display concern.

## Development

Requirements: supported Node.js 22 or 24. Node 26 is continuously tested as the current forward-compatibility lane.

```bash
npm install
npm run check
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

The source package has zero runtime dependencies. Development dependencies are exact-versioned; a committed lockfile is required before any npm release. See [docs/DEPENDENCY-BOOTSTRAP.md](./docs/DEPENDENCY-BOOTSTRAP.md).

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
| Release identity | npm Trusted Publishing + OIDC provenance |

See [docs/QUALITY-GATES.md](./docs/QUALITY-GATES.md), [docs/TEST-MATRIX.md](./docs/TEST-MATRIX.md), and [docs/VERIFICATION-STATUS.md](./docs/VERIFICATION-STATUS.md).

## Security model

Bidi controls, localization files, dependency changes, and CI workflows are treated as security-sensitive surfaces. The project publishes a threat model and deliberately avoids HTML-generating helpers for highlighting or localization.

- [SECURITY.md](./SECURITY.md)
- [docs/THREAT-MODEL.md](./docs/THREAT-MODEL.md)
- [docs/REPOSITORY-SETTINGS.md](./docs/REPOSITORY-SETTINGS.md)

## API and compatibility

- [docs/API-CONTRACT.md](./docs/API-CONTRACT.md)
- [docs/COMPATIBILITY.md](./docs/COMPATIBILITY.md)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/STANDARDS.md](./docs/STANDARDS.md)

Pre-1.0 releases may refine APIs, but breaking changes still require explicit changelog entries and migration notes.

## Open-source program readiness

The repository is structured to provide legitimate engineering evidence for OSS programs: public reusable code, an OSI license, cross-browser test need, localization workflows, accessibility testing, public governance, security controls, and clear separation from Rawafid's scientific corpus. Where an application asks for the official project/platform website, use **https://healthrenewal.org/**; where it asks for source code, use this repository. Acceptance by BrowserStack, Transifex, Sentry, Weblate, JetBrains, Docker, GitLab, TestMu, or any other provider remains entirely subject to that provider's current rules.

See [docs/OSS-PROGRAM-READINESS.md](./docs/OSS-PROGRAM-READINESS.md).

## Contributing

Contributions are welcome when they are reusable beyond Rawafid and stay inside the public scope. Every behavior change should include tests and a standards/compatibility rationale where relevant.

See [CONTRIBUTING.md](./CONTRIBUTING.md), [GOVERNANCE.md](./GOVERNANCE.md), and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

Apache License 2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
