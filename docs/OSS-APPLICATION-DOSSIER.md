# Open-source application dossier

This dossier is the reusable evidence pack for infrastructure, localization, developer-tooling, accessibility, browser/runtime, research-software, and open-source program applications involving the **Rawafid Arabic/RTL Accessibility & Localization Toolkit**.

It exists to make applications accurate, consistent, technically reviewable, and cheap for a partner to verify. It is not evidence that any provider has approved the project. Provider terms can change; the applicant must re-check the provider's current official criteria immediately before submission.

**Criteria and repository evidence review date:** 2026-08-25

## Canonical project facts

| Field | Canonical answer |
| --- | --- |
| Platform / organization name | Rawafid (روافد) |
| Project name | Rawafid Arabic/RTL Accessibility & Localization Toolkit |
| Official platform website | https://healthrenewal.org/ |
| Public source repository | https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit |
| Package | `@rawafid/arabic-rtl-a11y-toolkit` after npm publication |
| License | Apache-2.0 |
| Source visibility | Public |
| Runtime dependencies | Zero |
| Primary implementation | TypeScript / standards-based Web APIs |
| Browser verification | Chromium, Firefox, WebKit, mobile Chromium |
| Runtime quality lanes | Node 22, 24, and 26 |
| Project scope | Reusable Arabic/RTL, bidi, i18n, accessibility, Unicode/text, interaction, CSS, research/evidence, and verification infrastructure |

Use `docs/PROJECT-IDENTITY.md` as the canonical identity policy and `OPEN_SOURCE_SCOPE.md` as the repository publication boundary.

## One-minute evidence index

Applications should link reviewers directly to evidence rather than requiring them to reconstruct claims from README prose.

| Reviewer question | Primary repository evidence |
| --- | --- |
| Is the source public and reusable? | `README.md`, `OPEN_SOURCE_SCOPE.md`, `LICENSE`, `NOTICE` |
| Can an external partner run the project's highest-value workload directly? | `conformance/partner-suite.json`, `scripts/run-partner-suite.mjs`, `docs/PARTNER-INTEROPERABILITY.md` |
| Is the partner workload machine-readable and portable? | `conformance/partner-suite.json`, `schemas/partner-suite.schema.json`, Playwright JSON/JUnit/HTML outputs, `partner-results/evidence-summary.json` in CI evidence |
| Are standards claims separated from marketing claims? | `conformance/manifest.json`, `schemas/conformance-manifest.schema.json`, explicit `nonClaim` boundaries |
| Is Arabic/RTL browser behavior substantive? | `tests/e2e/conformance-lab.spec.ts`, `tests/e2e/accessibility.spec.ts`, `tests/e2e/accessibility-environments.spec.ts`, dynamic `dir=auto` input and traversal vectors |
| Are there reusable research assets rather than only library code? | `research/assets.json`, `tests/fixtures/unicode-display-risk-corpus.json`, `tests/fixtures/grapheme-interoperability-corpus.json` |
| Can research/catalog systems discover and cite the software? | `codemeta.json`, `CITATION.cff`, `schemas/research-assets.schema.json` |
| Is localization a real QA workload? | `qa/localization-contract.json`, generated `partner-results/localization-qa.json`, `docs/LOCALIZATION-QA-EVIDENCE.md`, `locales/` |
| Does localization QA cover RTL-specific failure modes? | placeholder parity, markup-token parity, legacy bidi-control rejection, isolate-balance checks, contextual zero-width reporting |
| Is accessibility a real engineering surface? | `src/a11y/`, axe-core browser regression tests, WCAG-oriented conformance fixtures, forced-colors/reduced-motion tests, RTL keyboard/grid/typeahead behavior |
| Is security posture machine-readable? | `security-insights.yml`, `SECURITY.md`, `docs/OSPS-BASELINE.md`, CodeQL, Dependency Review, OpenSSF Scorecard |
| Are security gaps disclosed rather than hidden? | `docs/OSPS-BASELINE.md` records the directly observed unprotected `main` branch state as a gap |
| Is release identity protected? | `.github/workflows/release.yml`, `scripts/check-release-policy.mjs`, `docs/RELEASE-PROVENANCE.md` |
| Is the tested release artifact the publication subject? | release workflow builds one `.tgz`, publishes that exact tarball, and requires npm `dist.integrity` SHA-512 equality |
| Is signed provenance designed into releases? | npm Trusted Publishing/provenance plus GitHub/Sigstore build-provenance and SBOM attestation steps; public evidence remains release-specific |
| Is the package API governed? | `api/public-api.json`, `api/public-types.sha256`, `docs/PUBLIC-API.md`, documentation contract gate |
| Is private Rawafid content excluded? | `OPEN_SOURCE_SCOPE.md`, scope guard, clean-room extraction rule |
| Are machine contracts standard-tool friendly? | Draft 2020-12 schemas under `schemas/` and `docs/MACHINE-READABLE-CONTRACTS.md` |

### What a technical reviewer can consume without custom integration

The repository deliberately emits or publishes standard surfaces rather than requiring a provider to parse bespoke logs:

- Playwright JSON, JUnit, HTML, and a compact validated evidence summary;
- Draft 2020-12 JSON Schemas for principal machine contracts;
- SPDX JSON SBOM generation in the release path;
- CodeMeta 3.1 and Citation File Format metadata;
- OpenSSF Security Insights plus an OSPS evidence map;
- manifest-driven browser workloads and machine-readable research assets;
- package integrity via npm `dist.integrity` and release-attestation policy.

This reduces initial due-diligence and integration work for browser-testing providers, localization platforms, universities, accessibility teams, security reviewers, and developer-tool vendors.

## Provider-specific fit

The entries below describe fit, not approval. Re-check the linked official program before applying.

### BrowserStack Open Source

Official program: https://www.browserstack.com/open-source

Strong fit signals:

- the project is public and Apache-2.0 licensed;
- browser interoperability is a first-class requirement rather than a marketing add-on;
- the partner suite is manifest-driven and already validates Chromium, Firefox, WebKit, and mobile Chromium;
- controlled evidence covers `dir=auto` traversal, dynamic direction changes in text/search/tel/url/email inputs, localized number input, RTL/LTR visual references, accessibility behavior, forced colors, and reduced motion;
- partner results are exported as standard JSON/JUnit/HTML plus a validated compact evidence summary;
- additional real-device, browser-version, and visual-history coverage would produce direct public engineering evidence rather than merely serving a private application.

Application emphasis: link reviewers to `conformance/partner-suite.json`, `docs/PARTNER-INTEROPERABILITY.md`, `tests/e2e/`, and a current green CI run. Explain that provider infrastructure can execute an already-defined public workload rather than requiring a custom proof-of-concept.

Do not claim BrowserStack execution until credentials/integration and observed provider runs exist.

### Transifex Open Source

Official program: https://www.transifex.com/open-source/

Current published eligibility language must be checked again at submission time. Historically/currently reviewed criteria include publicly available source under an OSI-approved license and project-specific funding/revenue/commercialization restrictions.

Repository fit signals:

- public Apache-2.0 source;
- real localization catalogs plus machine-readable QA;
- `qa/localization-contract.json` defines checks for key/placeholder integrity, conservative markup parity, legacy bidi controls, isolate balance, and contextual zero-width signals;
- locale negotiation, pseudo-localization, formatting, pluralization, display-name, numbering-system, and localized-input code provide genuine i18n engineering scope;
- CI can consume localization changes without allowing a translation platform to bypass structural or bidi-sensitive checks.

Critical application gate: confirm truthfully at submission time that the **toolkit project itself** satisfies Transifex's then-current funding/revenue/commercialization criteria. Do not infer eligibility merely because Rawafid's broader platform and this toolkit have separate scopes.

### Weblate Libre hosting

Official project: https://weblate.org/
Hosted documentation: https://docs.weblate.org/

The toolkit is technically suitable for repository-backed translation infrastructure because its catalogs are public, version-controlled, and checked by a provider-neutral localization QA contract.

Application/integration emphasis:

- keep translation components public;
- use repository-backed synchronization;
- expose the localization QA contract/report as the quality boundary;
- preserve CI so platform-generated changes cannot bypass key, placeholder, markup, or bidi checks.

Do not commit hosted-service project identifiers, credentials, or configuration until the corresponding Weblate project actually exists.

### Universities and research-software infrastructure

The repository now has evidence surfaces specifically useful to universities, research groups, software catalogs, and reproducibility reviewers:

- `codemeta.json` using CodeMeta 3.1;
- `CITATION.cff` for citation tooling;
- `research/assets.json` plus a JSON Schema describing reusable corpora/evidence assets;
- independently authored Arabic-aware Unicode display-risk and grapheme interoperability corpora;
- explicit provenance and non-conformance boundaries so the project does not represent its corpora as copies of Unicode conformance data;
- reproducible-build, package-contract, multi-runtime, and browser evidence.

Partnership emphasis: offer concrete research/test assets and reproducible workloads that a university can use, extend, evaluate, or cite—not a vague request for institutional endorsement.

Do not imply peer review, DOI assignment, academic publication, accreditation, institutional endorsement, or Unicode/W3C certification unless an external record actually exists.

### JetBrains Open Source

Official OSS information: https://www.jetbrains.com/community/opensource/

Strong fit evidence is the project being an active developer-facing TypeScript library with a public OSI-approved license, machine-readable API/evidence contracts, sustained automated testing, security controls, research metadata, and a contribution model.

Application emphasis: position the toolkit as developer infrastructure for an under-served engineering domain—Arabic/RTL accessibility, localization, Unicode-safe interaction, and interoperability—not as a private Rawafid application.

### GitLab for Open Source

Official program documentation: https://docs.gitlab.com/subscriptions/community_programs/

GitLab's current program criteria must be re-checked at application time. The repository includes `.gitlab-ci.yml`, demonstrating that the toolkit's engineering value is not structurally dependent on GitHub-only CI.

Critical application gate: GitLab evaluates the applying GitLab namespace and current program conditions, not merely this GitHub repository. Create/use a qualifying public namespace before claiming program eligibility.

### Security, supply-chain, and developer-infrastructure partners

The repository gives security and infrastructure reviewers concrete work products:

- OpenSSF Security Insights and an OSPS control/evidence map;
- CodeQL, Dependency Review, SHA-pinned GitHub Actions, deterministic lockfile installation, and public-scope guards;
- exact npm tarball publication policy with SHA-512 registry identity verification;
- npm OIDC/provenance design and GitHub/Sigstore build/SBOM attestation configuration;
- a static CI guard that fails if core release-integrity controls are removed.

The project intentionally does **not** claim SLSA level certification, independent security audit, or release attestation evidence before the corresponding public release has completed.

### Sentry and other providers

Do not assume a current sponsored/open-source plan exists simply because a vendor has historically supported open source. For Sentry, TestMu, Docker, or any other provider, find the provider's current official program page and eligibility terms before naming a specific benefit in an application.

A provider can still be a useful technical integration partner even when no dedicated OSS sponsorship program is currently verified.

## Application narrative

Keep the application factual, engineering-led, and evidence-first:

> Rawafid Arabic/RTL Accessibility & Localization Toolkit is a public Apache-2.0, zero-runtime-dependency TypeScript project providing framework-agnostic infrastructure and reusable evidence for bidirectional web interfaces, Arabic and multilingual localization, accessibility interactions, Unicode-safe text handling, localized numeric input, and browser interoperability. Its partner workload is manifest-driven and produces standard JSON/JUnit/HTML plus a validated evidence summary across Chromium, Firefox, WebKit, and mobile Chromium. The repository also publishes machine-readable localization QA, Draft 2020-12 schemas, Arabic-aware Unicode/grapheme research corpora, CodeMeta/CITATION metadata, OpenSSF Security Insights/OSPS evidence, deterministic package checks, and an exact-tarball release policy that verifies npm SHA-512 identity before configured build/SBOM attestations. Rawafid's scientific/editorial corpus and production secrets are explicitly excluded from this public repository. The requested program resources would be used directly to expand measurable public interoperability, localization, accessibility, research, or supply-chain evidence.

Adjust the final sentence to the provider and describe the exact public workload their infrastructure would improve. Do not change factual eligibility answers to improve acceptance odds.

## High-value application attachments / links

When a form permits multiple supporting links, prioritize these rather than sending a long undifferentiated list:

1. Repository root / README — project identity, engineering scope, and due-diligence index.
2. `conformance/partner-suite.json` — exact executable partner workload.
3. `conformance/manifest.json` — standards-backed claims and non-claims.
4. `research/assets.json` — reusable corpora/evidence catalog.
5. `qa/localization-contract.json` — localization QA contract.
6. `security-insights.yml` + `docs/OSPS-BASELINE.md` — security posture including disclosed gaps.
7. `docs/RELEASE-PROVENANCE.md` — release-integrity model.
8. `codemeta.json` / `CITATION.cff` — research-software discovery/citation when relevant.
9. A **current green CI run** for the exact commit being reviewed.

The strongest application is generally one where the reviewer can reproduce the project's claimed need from these links without requesting private screenshots or undocumented metrics.

## Rejection-risk controls

Before submitting any application:

1. Confirm the provider's criteria on its current official site.
2. Confirm the repository is public and the default branch/commit being cited is healthy.
3. Confirm `LICENSE`, `NOTICE`, `README.md`, contribution/governance/security files, and relevant test/evidence contracts are visible.
4. Confirm the latest relevant CI/security run is green; never cite an older run as evidence for a newer commit.
5. Confirm the exact commercial/funding/revenue status requested by that provider.
6. Use the canonical Rawafid/project/domain names exactly as defined in `docs/PROJECT-IDENTITY.md`.
7. Link directly to the repository evidence that justifies the requested benefit.
8. State how the provider's resource will improve the **public toolkit** rather than Rawafid's private/scientific systems.
9. Do not claim users, downloads, contributors, coverage percentages, certifications, sponsorships, program acceptance, provider integrations, academic endorsement, or attestations that have not been observed.
10. Keep credentials and account-bound configuration outside Git; add provider-specific CI only after the account/integration exists.
11. **Do not claim that `main` is protected.** GitHub branch metadata observed on 2026-08-25 reported `main` as unprotected. Enable and re-verify an appropriate ruleset/branch-protection policy before making a protected-branch claim.
12. After the first npm/public release, verify the actual registry package, provenance, SBOM, and GitHub attestation records before citing them as completed release evidence.

## Evidence that remains external or conditional

Repository quality cannot by itself prove account-bound states. See `docs/VERIFICATION-STATUS.md` and `docs/OSPS-BASELINE.md` for the authoritative boundaries.

As of the 2026-08-25 evidence review:

- **Observed gap:** `main` was reported by GitHub as `protected: false`; required-check enforcement, force-push prevention, and deletion protection must not be claimed until enabled and re-read from GitHub.
- **External-unverified:** maintainer MFA/passkey state, private vulnerability reporting enablement, and other account/repository settings not directly exposed by the current evidence.
- **Conditional:** first npm publication, npm ownership/2FA/bootstrap state, Trusted Publisher binding, public npm provenance, and GitHub build/SBOM attestations.
- **Provider-controlled:** acceptance, sponsorship, credits, licenses, hosted services, academic collaborations, and other external partnership outcomes.

The dossier should be updated when any of these states changes; repository files are not a substitute for observing the corresponding external system.
