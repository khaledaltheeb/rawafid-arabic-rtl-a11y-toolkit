# Changelog

All notable changes to this project are documented here. The project follows Semantic Versioning for public releases and the structure of Keep a Changelog.

## [Unreleased]

### Added

- Grapheme-safe segmentation, length, slicing, and truncation helpers built on `Intl.Segmenter`.
- Pseudo-localization utilities for localization/layout QA while preserving common interpolation and markup tokens.
- Runtime locale capability introspection for direction, effective script/region, calendars, numbering systems, and hour cycles when exposed by ECMA-402.
- Unicode display-risk diagnostics covering bidi controls/overrides, unbalanced isolates, zero-width characters, and mixed-script identifiers without claiming full UTS #39 confusable detection.
- RTL-aware roving-focus and roving-tabindex state helpers with disabled-item handling for composite widgets.
- `docs/GLOBAL-PLATFORM.md` defining the integrated global engineering layer, standards posture, and non-claims.
- `docs/INTEROPERABILITY.md` defining framework-neutral integration boundaries, localization workflow, Unicode policy signals, and browser evidence.
- Cross-module unit coverage for the new global platform capabilities.
- Expanded built-package browser fixture covering mixed-direction forms, breadcrumb navigation, tabular identifiers/numbers, RTL composite tabs, pseudo-localization, grapheme-safe truncation, and Unicode display-risk output.
- Browser assertions that RTL roving focus skips disabled items and that the expanded fixture remains free of horizontal document overflow.

### Changed

- Hardened the repository's release and dependency-management posture after live GitHub Actions validation.
- Added a committed npm lockfile and switched CI/Docker/GitLab verification paths to deterministic installs.
- Standardized the CI npm toolchain across Node 22, 24, and 26.
- Preserved Node 22 as the TypeScript API baseline while retaining runtime CI coverage on Node 22/24/26.
- Updated CodeQL Actions to 4.37.8 after a fully green PR validation cycle.
- Added repository ownership metadata and clarified first-publication readiness requirements.
- Defined the canonical project identity: the platform name is Rawafid (روافد), the official production website is `https://healthrenewal.org/`, and this GitHub repository is the separate open-source source-code home for the toolkit.
- Pointed npm package homepage metadata to the official Rawafid website while preserving GitHub as the canonical repository and issue tracker.
- Expanded the public API surface with reusable Unicode, localization QA, locale metadata, grapheme, and composite-widget interaction primitives while retaining zero runtime dependencies.
- Reworked the README into a capability map and integration guide for the broader global platform surface.
- Advanced the roadmap to reflect completed grapheme, pseudo-localization, Unicode diagnostics, locale-capability, roving-focus, and mixed-direction fixture work instead of listing it as future scope.

### Fixed

- ESLint Node globals for `.mjs` tooling files.
- Playwright configuration under `exactOptionalPropertyTypes`.
- Package type-resolution validation so CSS export subpaths do not create false JavaScript resolution failures.
- Dependency Review behavior when GitHub Dependency Graph has not yet been enabled at repository level.
- Corrected identity/link guidance so the `healthrenewal.org` domain is never treated as the product name and Rawafid is never conflated with the toolkit repository.
- Roving-tabindex recovery now preserves locality by choosing the next enabled item when the active item becomes disabled.
- Pseudo-localization fractional expansion ratios now produce deterministic text expansion instead of being rounded away.

### Remaining external setup

- Enable GitHub Dependency Graph and the desired repository security features in repository settings.
- Confirm ownership of the intended npm scope, perform the one-time 2FA-protected bootstrap publication, then configure npm Trusted Publishing for `release.yml` and the GitHub `npm` environment for subsequent releases.
- Add repository topics and branch/ruleset protections in GitHub settings.
- Add provider-backed infrastructure only after legitimate acceptance into an applicable OSS program.

## [0.2.0] - 2026-08-24

### Added

- Script-aware direction model covering thirteen modern RTL script families.
- Locale negotiation that refuses silent cross-script fallback.
- ALM and expanded Unicode bidi-control handling.
- SSR-safe focus and live-region utilities.
- Unicode-property-based Arabic combining-mark handling.
- Locale-aware source-preserving highlight segmentation.
- Chromium, Firefox, WebKit, and mobile Playwright matrix.
- CodeQL, Dependency Review, OpenSSF Scorecard, and SHA-pin verification workflows.
- publint and Are The Types Wrong package gates.
- OIDC-based npm release workflow with fail-closed lockfile/runtime requirements and SPDX SBOM generation.
- Threat model, standards baseline, API contract, compatibility policy, release policy, repository hardening checklist, and quality-gate documentation.
- Open-source scope and secret-like material guard.

### Changed

- Raised supported Node.js baseline from 20 to 22 because Node 20 is end-of-life.
- Replaced the maintenance-only tsup build path with tsdown.
- Tightened catalog validation and contribution/review gates.

## [0.1.0] - 2026-08-24

### Added

- Initial RTL, bidi, i18n, Arabic text, accessibility, logical CSS, pagination, unit-test, and browser-test primitives.
