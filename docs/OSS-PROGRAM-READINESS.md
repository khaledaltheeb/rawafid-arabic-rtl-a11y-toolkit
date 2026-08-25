# Open-source program readiness

This repository is structured to make legitimate open-source infrastructure and research partnerships easier to evaluate. Program acceptance is always at the provider's discretion and current provider terms control.

For the evidence-backed, provider-by-provider application pack, use [`docs/OSS-APPLICATION-DOSSIER.md`](./OSS-APPLICATION-DOSSIER.md). It records canonical facts, direct evidence links, current eligibility cautions, a reusable technical narrative, rejection-risk controls, and the external states that must not be inferred from repository files.

## Canonical identity for applications

- Platform/organization name: **Rawafid (روافد)**.
- Official production website: **https://healthrenewal.org/**.
- Open-source project: **Rawafid Arabic/RTL Accessibility & Localization Toolkit**.
- Source repository: **https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit**.
- npm package: `@rawafid/arabic-rtl-a11y-toolkit` after publication.

If an application asks for the official website, use `healthrenewal.org`. If it asks for source code or repository evidence, use the GitHub repository. Do not rename the platform to "Health Renewal" merely because of the domain.

## Evidence the repository now maintains

- Public Apache-2.0 source with complete build/test instructions and zero runtime dependencies.
- A manifest-driven partner interoperability suite with standard Playwright JSON/JUnit/HTML output and a compact validated evidence summary.
- Machine-readable standards claims with explicit non-claim boundaries.
- Draft 2020-12 JSON Schemas for principal partner, standards, localization, research, and evidence contracts.
- Arabic/RTL-aware Unicode display-risk and grapheme interoperability research corpora.
- Machine-readable localization QA covering keys/placeholders, conservative markup parity, bidi controls, isolate balance, and contextual zero-width signals.
- CodeMeta 3.1 and `CITATION.cff` for software discovery and citation workflows.
- OpenSSF Security Insights and an OSPS evidence map that distinguishes repository evidence, observed account states, conditional controls, and gaps.
- Deterministic package and reproducible-build checks plus an exact-tarball release policy: the verified `.tgz` is the npm publication subject, npm SHA-512 identity must match, and successful releases are configured for build/SBOM attestations.
- Public contribution/governance/security processes and explicit separation from Rawafid's scientific/editorial corpus, user data, production secrets, and proprietary publishing logic.

## Provider fit

- **Browser/device testing:** executable RTL/bidi, dynamic `dir=auto`, localized-input, accessibility, visual, mobile, forced-colors, and reduced-motion workloads across multiple browser engines.
- **Localization platforms:** public catalogs plus a provider-neutral Arabic/RTL localization QA contract that can remain authoritative when translations originate from an external platform.
- **Universities/research infrastructure:** CodeMeta/CFF metadata, independently authored research corpora, machine-readable asset catalog, reproducible test workloads, and explicit standards/non-conformance boundaries.
- **Accessibility tooling:** WCAG-oriented controlled fixtures, axe-core regression, RTL keyboard/grid/typeahead behavior, focus-obscuration, text-spacing, forced-colors, and reduced-motion evidence.
- **Security/supply-chain infrastructure:** CodeQL, Dependency Review, SHA-pinned Actions, Security Insights/OSPS evidence, deterministic packaging, SBOM, exact-registry-artifact verification, and attestation policy.
- **IDE/developer-tool programs:** sustained developer-facing TypeScript library, strict public API governance, tests, documentation, and portability across CI/container environments.
- **Git hosting/container programs:** public licensed source, GitLab CI portability, and non-root Docker test environment where relevant to current provider criteria.

## High-priority state still outside source control

Repository quality is not proof of account-level enforcement. The most important currently observed gap is GitHub primary-branch protection: on **2026-08-25**, GitHub reported `main` as `protected: false`. Do not claim protected-branch enforcement until an appropriate GitHub ruleset/branch-protection policy is enabled and re-verified.

Other states such as maintainer MFA/passkeys, private vulnerability-reporting enablement, npm bootstrap/ownership/2FA, Trusted Publisher binding, completed release attestations, and provider approvals remain external or conditional until directly observed.

Do not claim eligibility that has not been confirmed by the provider. Do not copy one provider's eligibility answer into another provider's form: funding, revenue, commercialization, namespace, activity, public-visibility, and governance requirements differ.
