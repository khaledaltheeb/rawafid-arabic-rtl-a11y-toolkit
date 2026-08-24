# Verification status

This document records evidence that has actually been observed for the repository and separates **source-level verification**, **GitHub CI evidence**, **external account/settings work**, and **future release evidence**. It must not be used to imply certification or a provider approval that has not occurred.

## Current verified engineering baseline

The repository now has a committed `package-lock.json`, deterministic npm installs, a complete TypeScript build/test toolchain, and real GitHub Actions evidence. The old bootstrap state in which dependencies could not be installed is no longer representative of the project.

For the latest merged global-platform/interoperability work before this document update, GitHub pull-request validation has successfully exercised:

- open-source scope guard;
- full-SHA GitHub Actions pin verification;
- Arabic/English catalog key, placeholder, emptiness, and bidi-control validation;
- ESLint with zero warnings;
- strict TypeScript with the repository's exact settings;
- Vitest unit tests;
- tsdown ESM/declaration build;
- publint package validation;
- Are The Types Wrong root JavaScript/type resolution validation;
- Node.js 22, 24, and 26 quality lanes;
- Chromium, Firefox, WebKit, and mobile-Chromium Playwright projects;
- axe-core against the controlled RTL fixture;
- mixed-direction browser scenarios including Arabic/English text, emails, locale identifiers, tables, forms, breadcrumb navigation, logical CSS, live regions, and RTL roving-focus behavior;
- built-package execution of grapheme-safe truncation, pseudo-localization, locale direction, and Unicode display-risk helpers;
- horizontal document-overflow regression checks;
- CodeQL JavaScript/TypeScript analysis;
- Dependency Review;
- committed lockfile use via `npm ci`.

These are engineering regression gates, not claims of WCAG certification, Unicode security conformance, linguistic correctness, or universal browser correctness.

## Package and supply-chain state

Verified in repository source:

- `package-lock.json` is committed and is the deterministic dependency input for CI;
- the package declares zero runtime dependencies;
- development dependencies are exact-versioned;
- GitHub Actions references are pinned to full commit SHAs;
- Docker and GitLab verification use deterministic `npm ci`;
- npm release design is fail-closed around tag/version identity, supported Node/npm publishing requirements, package checks, and SBOM generation;
- the release workflow is designed for npm Trusted Publishing/OIDC after the required first-package bootstrap has been completed.

## Security and scope boundaries

Verified repository controls include:

- a machine-enforced public-scope/secret-like-material guard;
- documented clean-room extraction and prohibited-content rules;
- explicit separation between Rawafid production/scientific content and the public toolkit;
- CodeQL and Dependency Review workflows;
- an OpenSSF Scorecard workflow;
- minimal declared workflow permissions and SHA-pinned third-party actions.

Automated scope/security checks are defense in depth. Human review remains mandatory for proprietary-content provenance, subtle secrets, malicious Unicode intent, accessibility semantics, and dependency/license decisions.

## Evidence that remains external or account-bound

The following must **not** be described as completed until directly verified in the relevant service/account:

- GitHub `main` branch/ruleset protection and required-check enforcement;
- GitHub repository topics/community switches/security settings that require repository-settings access;
- npm ownership/write access for the intended `@rawafid` scope;
- npm account 2FA state;
- the one-time first publication of the package;
- npm Trusted Publisher binding and a successful subsequent OIDC/provenance publication;
- acceptance into BrowserStack, Transifex, Sentry, Weblate, JetBrains, Docker, GitLab, TestMu, or any other external OSS program;
- provider-specific credentials or CI integrations.

The repository must never infer those states merely because corresponding workflows or documentation exist.

## Release evidence policy

For any public claim about a release:

1. identify the exact release/tag commit;
2. verify the applicable CI/security gates for that commit;
3. verify package metadata and tarball shape;
4. verify npm registry publication separately from GitHub release creation;
5. verify provenance/SBOM evidence where claimed;
6. record any skipped/non-applicable gate honestly.

A badge, documentation file, local run, or earlier green commit is not sufficient evidence that a later commit passed the same gate.

## Accessibility evidence policy

Automated axe and browser tests are regression evidence only. They cannot establish complete WCAG conformance. Keyboard behavior, focus order, semantics, labels, content quality, screen-reader behavior, zoom/reflow, contrast in all states, localization quality, and assistive-technology interoperability still require appropriate manual/product-level evaluation.

## Locale and Unicode evidence policy

Most locale-sensitive output is supplied by the host runtime's ICU/CLDR/Unicode implementation. Exact punctuation, localized names, plural behavior, segment boundaries, calendars, numbering systems, and related data can evolve independently of this repository.

Unicode display-risk diagnostics in this toolkit are intentionally limited defense-in-depth signals. They are not a full UTS #39 confusable implementation, malware verdict, or source-code Trojan Source scanner.
