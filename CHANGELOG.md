# Changelog

All notable changes to this project are documented here. The project follows Semantic Versioning for public releases and the structure of Keep a Changelog.

## [Unreleased]

### Added

- Grapheme-safe segmentation, length, slicing, and truncation helpers built on `Intl.Segmenter`.
- Locale-aware word and sentence segmentation, including host-provided `isWordLike` metadata and a word-only convenience API.
- Pseudo-localization utilities for localization/layout QA while preserving common interpolation and markup tokens.
- Runtime locale capability introspection for direction, effective script/region, calendars, numbering systems, hour cycles, collations, time zones, and week information when exposed by ECMA-402.
- Runtime-supported-value discovery through `Intl.supportedValuesOf` without vendoring locale registries.
- `Intl.PluralRules` helpers for cardinal/ordinal category selection, resolved-options inspection, and runtime-gated plural range selection.
- `Intl.DisplayNames` helpers for standardized locale-sensitive names of supported language/script/region/currency/calendar/date-time-field codes.
- Structured `formatToParts` wrappers for numbers, dates, lists, and relative time for component-level and bidi-aware rendering.
- Unicode display-risk diagnostics covering bidi controls/overrides, unbalanced isolates, zero-width characters, and mixed-script identifiers without claiming full UTS #39 confusable detection.
- RTL-aware roving-focus and roving-tabindex state helpers with disabled-item handling for composite widgets.
- Locale-aware typeahead matching with `Intl.Collator` search semantics, grapheme-safe prefixes, deterministic multi-character buffer state, and Arabic/Latin-script tests.
- Composite selection primitives that keep active/focus state independent from selected state, including single, multiple, non-empty, disabled-item, and inclusive-range behavior.
- Direction-aware rectangular grid navigation with RTL physical horizontal arrows, vertical movement, row Home/End, grid Control+Home/End, caller-defined paging, conservative non-wrapping data-grid defaults, and opt-in layout-grid wrapping.
- Conservative decimal digit-system detection, explicit conversion, and search-key normalization for `latn`, `arab`, and `arabext`, including mixed-system diagnostics without altering separators or identifiers.
- Digit-system-equivalent Arabic search keys and typeahead matching so Latin, Arabic-Indic, and Extended Arabic-Indic decimal digits can match without changing display labels.
- Built-package contract gate that imports the real `dist/index.js`, validates export/subpath integrity and SSR-safe import behavior, and executes direction, digit, typeahead, selection, and RTL-grid runtime invariants.
- `docs/GLOBAL-PLATFORM.md` defining the integrated global engineering layer, standards posture, and non-claims.
- `docs/INTEROPERABILITY.md` defining framework-neutral integration boundaries, localization workflow, Unicode policy signals, and browser evidence.
- `docs/SELECTION-MODELS.md` defining active-versus-selected state semantics and selection boundaries.
- `docs/GRID-NAVIGATION.md` defining rectangular grid index, RTL movement, wrapping, paging, and host-semantics boundaries.
- `docs/COMPOSITE-INTERACTIONS.md` defining the integrated movement/typeahead/selection/grid architecture and its source/package/browser verification layers.
- `docs/DIGIT-SYSTEMS.md` defining text-level digit interoperability, formatting boundaries, and claim limits.
- Cross-module unit coverage for global platform capabilities, including Arabic plural categories, locale-sensitive segmentation/formatting, digit systems, typeahead, selection, and RTL/LTR grid behavior.
- Expanded built-package browser fixture covering mixed-direction forms, breadcrumbs, tabular identifiers/numbers, RTL composite tabs, locale-aware typeahead, a semantic 2×3 RTL grid, pseudo-localization, grapheme-safe truncation, and Unicode display-risk output.
- Browser assertions for RTL roving focus, disabled-item skipping, typeahead, modifier/composition boundaries, physical RTL grid movement, vertical movement, Home/End, single grid tab stop, and horizontal-overflow prevention across Chromium, Firefox, WebKit, and mobile Chromium.

### Changed

- Hardened the repository's release and dependency-management posture after live GitHub Actions validation.
- Added a committed npm lockfile and switched CI/Docker/GitLab verification paths to deterministic installs.
- Standardized the CI npm toolchain across Node 22, 24, and 26.
- Preserved Node 22 as the TypeScript API baseline while retaining runtime CI coverage on Node 22/24/26.
- Updated CodeQL Actions to 4.37.8 after a fully green PR validation cycle.
- Added repository ownership metadata and clarified first-publication readiness requirements.
- Defined the canonical project identity: the platform name is Rawafid (روافد), the official production website is `https://healthrenewal.org/`, and this GitHub repository is the separate open-source source-code home for the toolkit.
- Pointed npm package homepage metadata to the official Rawafid website while preserving GitHub as the canonical repository and issue tracker.
- Expanded the public API surface with reusable Unicode, localization QA, locale metadata, segmentation, pluralization, structured formatting, display-name, grapheme, digit, typeahead, selection, and grid-interaction primitives while retaining zero runtime dependencies.
- Reworked the README into a capability map and integration guide for the broader global platform surface.
- Advanced the roadmap to reflect completed grapheme, pseudo-localization, Unicode diagnostics, locale-capability, roving-focus, and mixed-direction fixture work instead of listing it as future scope.
- Strengthened `docs/API-CONTRACT.md` with explicit host-ICU/CLDR variability contracts, typeahead/selection/grid boundaries, and built-package verification semantics.
- Expanded `docs/QUALITY-GATES.md` with an explicit built-package behavior gate and full composite-browser evidence model.
- Expanded `docs/TEST-MATRIX.md` to cover locale intelligence, typeahead, selection, rectangular grid navigation, package-contract invariants, and the semantic browser grid.
- Extended the main `npm run check` gate so package-contract validation is mandatory after source, lint, type, unit, publint, and declaration-resolution checks.

### Fixed

- ESLint Node globals for `.mjs` tooling files.
- Playwright configuration under `exactOptionalPropertyTypes`.
- Package type-resolution validation so CSS export subpaths do not create false JavaScript resolution failures.
- Dependency Review behavior when GitHub Dependency Graph has not yet been enabled at repository level.
- Corrected identity/link guidance so the `healthrenewal.org` domain is never treated as the product name and Rawafid is never conflated with the toolkit repository.
- Roving-tabindex recovery now preserves locality by choosing the next enabled item when the active item becomes disabled.
- Pseudo-localization fractional expansion ratios now produce deterministic text expansion instead of being rounded away.
- Structured list-format part typing now derives from the host API return type instead of relying on a TypeScript library alias absent from the Node 22 baseline.
- Removed an unstable German collation test assumption (`Ö` versus `O`) and retained only locale behavior guaranteed by the platform contract instead of forcing ICU/CLDR-specific expectations.
- Corrected the semantic RTL grid fixture layout so each ARIA row renders as an actual three-column visual row.

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