# Changelog

All notable changes to this project are documented here. The project follows Semantic Versioning for public releases and the structure of Keep a Changelog.

## [Unreleased]

### Changed

- Hardened the repository's release and dependency-management posture after live GitHub Actions validation.
- Added a committed npm lockfile and switched CI/Docker/GitLab verification paths to deterministic installs.
- Standardized the CI npm toolchain across Node 22, 24, and 26.
- Preserved Node 22 as the TypeScript API baseline while retaining runtime CI coverage on Node 22/24/26.
- Updated CodeQL Actions to 4.37.8 after a fully green PR validation cycle.
- Added repository ownership metadata and clarified first-publication readiness requirements.
- Defined the canonical project identity: the platform name is Rawafid (روافد), the official production website is `https://healthrenewal.org/`, and this GitHub repository is the separate open-source source-code home for the toolkit.
- Pointed npm package homepage metadata to the official Rawafid website while preserving GitHub as the canonical repository and issue tracker.

### Fixed

- ESLint Node globals for `.mjs` tooling files.
- Playwright configuration under `exactOptionalPropertyTypes`.
- Package type-resolution validation so CSS export subpaths do not create false JavaScript resolution failures.
- Dependency Review behavior when GitHub Dependency Graph has not yet been enabled at repository level.
- Corrected identity/link guidance so the `healthrenewal.org` domain is never treated as the product name and Rawafid is never conflated with the toolkit repository.

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
