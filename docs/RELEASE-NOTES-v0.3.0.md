# v0.3.0 — Enterprise RTL audit and adoption layer

`v0.3.0` expands the Rawafid Arabic/RTL Accessibility & Localization Toolkit from reusable runtime primitives into a measurable engineering-assurance layer for Arabic and bidirectional products.

## Highlights

- Source Audit CLI for HTML, JSX/TSX, CSS, and common utility-class patterns.
- JSON and SARIF output suitable for CI and code-scanning workflows.
- Policy files with rule severity overrides, path exclusions, fail thresholds, and fail-closed rule validation.
- Stable finding fingerprints and baseline support for brownfield adoption without hiding new regressions.
- First-party GitHub Action with workspace containment, outputs, Step Summary, and SARIF generation.
- Enterprise Evaluation Kit with four reversible pilot profiles and measurable decision gates.
- Partner Offer Matrix covering design systems, accessibility platforms, localization/i18n, browser testing, DevSecOps/AppSec, MENA expansion, standards/OSS foundations, and OSS infrastructure programs.
- Expanded Unicode bidi-risk diagnostics, locale intelligence, segmentation, digit systems, formatting, typeahead, selection, roving focus, and direction-aware grid interaction.
- Browser evidence across Chromium, Firefox, WebKit, and mobile Chromium with axe-core coverage.

## Precision hardening from real dogfooding

The toolkit was run against Rawafid's production-site repository as an external consumer. That run exposed an overly broad utility-class detector that could misread application class names such as `primary-action` as physical-spacing utilities. The detector was corrected and protected by regression tests before this release.

The corrected production-site audit retained actionable warnings and advisory notes while producing zero blocking errors under the initial high-confidence policy. Rawafid therefore starts enforcement at the error threshold instead of suppressing existing warnings with a broad baseline.

## Supply-chain and release evidence

The release candidate is gated by deterministic installation, the full repository verification suite, package-shape checks, packed-consumer tests, reproducible-build checks, browser tests in CI, SBOM generation, exact tarball integrity verification, and GitHub release evidence.

The one-time first npm publication uses a repository secret only for bootstrap authentication. Routine publishing remains designed for npm Trusted Publishing/OIDC so the bootstrap credential can be removed after the publisher relationship is proven.

## Non-claims

This release does not by itself certify a consuming application for WCAG, ISO/IEC 40500, EN 301 549, EAA, or any other accessibility regime. Unicode diagnostics are risk-oriented engineering checks and do not claim full UTS #39 confusable/security analysis. Localization helpers do not certify linguistic or cultural quality. Final product semantics, assistive-technology behavior, security review, and human localization QA remain responsibilities of the consuming application and its teams.
