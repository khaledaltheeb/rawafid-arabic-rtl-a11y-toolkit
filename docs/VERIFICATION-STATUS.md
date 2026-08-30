# Verification status

This document records evidence that has actually been observed for the repository and separates **source-level verification**, **GitHub CI evidence**, **external account/settings work**, and **future release evidence**. It must not be used to imply certification or a provider approval that has not occurred.

## Current verified engineering baseline

The repository has a committed `package-lock.json`, deterministic npm installs, a complete TypeScript build/test toolchain, a public `v0.3.0` package release, and real GitHub Actions evidence.

GitHub validation has successfully exercised:

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

Verified in repository and release evidence:

- `package-lock.json` is committed and is the deterministic dependency input for CI;
- the package declares zero runtime dependencies;
- development dependencies are exact-versioned;
- GitHub Actions references are pinned to full commit SHAs;
- Docker and GitLab verification use deterministic `npm ci`;
- `@rawafid/arabic-rtl-a11y-toolkit@0.3.0` is public on npm;
- GitHub Release `v0.3.0` exists with the exact package tarball, release notes, and SPDX SBOM;
- registry `dist.integrity` for v0.3.0 was verified against the locally built tarball;
- post-publication GitHub attestations were generated only after registry identity was verified;
- the one-time bootstrap publication path has been retired from the permanent release workflow;
- the permanent release workflow is release-event-only and designed for npm Trusted Publishing/OIDC.

### v0.3.0 provenance boundary

`v0.3.0` was created through the isolated one-time npm token bootstrap with npm provenance disabled. It must **not** be described as an npm Trusted Publishing provenance release. The later GitHub attestations are separate evidence and do not retroactively change how the npm package was published.

## Security and scope boundaries

Verified repository controls include:

- a machine-enforced public-scope/secret-like-material guard;
- documented clean-room extraction and prohibited-content rules;
- explicit separation between Rawafid production/scientific content and the public toolkit;
- CodeQL and Dependency Review workflows;
- an OpenSSF Scorecard workflow;
- minimal declared workflow permissions and SHA-pinned third-party actions;
- an explicit private security-report route;
- a Code of Conduct reporting route separate from security disclosure;
- documented founder-led governance and a stakeholder-dialogue process.

Automated scope/security checks are defense in depth. Human review remains mandatory for proprietary-content provenance, subtle secrets, malicious Unicode intent, accessibility semantics, conduct reports, stakeholder trade-offs, and dependency/license decisions.

## Evidence that remains external or account-bound

The following must **not** be described as completed until directly verified in the relevant service/account:

- GitHub `main` branch/ruleset protection and required-check enforcement — current public branch metadata reports `main` as unprotected;
- GitHub repository topics/community switches/security settings that require repository-settings access;
- the package-level npm Trusted Publisher binding for the permanent OIDC workflow;
- removal/revocation of any obsolete bootstrap publication credential if still active outside repository source;
- a successful future normal npm publication through the OIDC/Trusted Publisher path with independently visible npm provenance;
- acceptance into BrowserStack, Transifex, Sentry, Weblate, JetBrains, Docker, GitLab, TestMu, or any other external OSS program unless separately verified;
- provider-specific credentials or CI integrations.

The repository must never infer those states merely because corresponding workflows or documentation exist.

## Governance and contributor-readiness evidence

The repository publishes:

- [CONTACT.md](../CONTACT.md) for ownership and contact paths;
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) for community behavior, private reporting, conflicts, and enforcement;
- [GOVERNANCE.md](../GOVERNANCE.md) for current roles, material decision rights, reviewer/maintainer progression, and founder-led transition boundaries;
- [STAKEHOLDER-DIALOGUE.md](./STAKEHOLDER-DIALOGUE.md) for selecting relevant stakeholder perspectives, collecting accessible asynchronous input, recording disagreement, and revisiting decisions;
- [CONTRIBUTING.md](../CONTRIBUTING.md) for the public contribution workflow.

These documents establish process readiness; they do not prove that an independent contributor community or multi-maintainer governance structure already exists. That evidence can only emerge from real participation over time.

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
