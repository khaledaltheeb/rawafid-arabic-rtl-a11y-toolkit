# OpenSSF Best Practices — Passing evidence map

This document maps the repository's current, public evidence to the **OpenSSF Best Practices Passing** criteria at <https://www.bestpractices.dev/en/criteria/0>.

It is an internal due-diligence aid, **not a badge and not a claim that OpenSSF has certified the project**. The authoritative status is whatever a future public BadgeApp project record reports. Do not add a Best Practices badge to the README until that record actually reaches the corresponding level.

Status vocabulary:

- **Met — public evidence:** repository evidence directly supports the criterion.
- **N/A candidate:** the official criterion permits N/A and the capability is outside this library's design; the maintainer must use the official form's allowed N/A/justification field.
- **Manual attestation:** the criterion asks about developer knowledge or historical response behavior that cannot be truthfully inferred from files alone.
- **Follow-up:** evidence or an account-bound setting still needs verification.

## Basics

| Criterion | Status | Evidence / justification |
| --- | --- | --- |
| `description_good` | Met — public evidence | `README.md` and `package.json` describe the toolkit as framework-neutral Arabic/RTL, localization, bidi-safety, accessibility, Unicode and direction-aware web primitives. |
| `interact` | Met — public evidence | `README.md` documents obtaining/building the project and links to `CONTRIBUTING.md`; `CONTRIBUTING.md` identifies issue and PR routes; `package.json#bugs` points to the public issue tracker. |
| `contribution` | Met — public evidence | `CONTRIBUTING.md#contribution-process` explicitly documents issue → branch/fork → tests/docs → PR → review → merge. |
| `contribution_requirements` (SHOULD) | Met — public evidence | `CONTRIBUTING.md#engineering-expectations`, PR content requirements, scope rules and local validation. |
| `floss_license` | Met — public evidence | Apache-2.0. |
| `floss_license_osi` (SUGGESTED) | Met — public evidence | Apache-2.0 is OSI-approved. |
| `license_location` | Met — public evidence | Top-level `LICENSE` plus `NOTICE`; `package.json` identifies `Apache-2.0`. |
| `documentation_basics` | Met — public evidence | `README.md` installation/build/quick-start/integration rules; `SECURITY.md`; development commands. npm registry installation remains explicitly future-gated until #90 is resolved, while clone/build instructions remain available now. |
| `documentation_interface` | Met — public evidence | `docs/API-CONTRACT.md` describes the public library interfaces, inputs/outputs, runtime variability and error contracts; `src/index.ts` defines public exports. |
| `sites_https` | Met — public evidence | Canonical website and source/release URLs use HTTPS (`healthrenewal.org`, `github.com`). |
| `discussion` | Met — public evidence | Public GitHub Issues and pull-request discussions are searchable and URL-addressable. |
| `english` (SHOULD) | Met — public evidence | Repository documentation, issues, contribution process and code comments accept/use English. |
| `maintained` | Met — public evidence | Active commits, issues, CI, upstream work and explicit vulnerability-response process. Note: OpenSSF **Scorecard** separately scores its automated Maintained check as 0 while the repository is <90 days old; that is a different automated heuristic, not evidence that this Passing criterion is unmet. |

## Change control

| Criterion | Status | Evidence / justification |
| --- | --- | --- |
| `repo_public` | Met — public evidence | Public GitHub repository. |
| `repo_track` | Met — public evidence | Git commit history identifies changes, authors and timestamps. |
| `repo_interim` | Met — public evidence | Public commits and PRs exist between releases; repository does not expose only final tarballs. |
| `repo_distributed` (SUGGESTED) | Met — public evidence | Git. |
| `version_unique` | Met — public evidence | `package.json` version plus GitHub release/tag history (`v0.2.0`). |
| `version_semver` (SUGGESTED) | Met — public evidence | `CHANGELOG.md` explicitly states Semantic Versioning. |
| `version_tags` (SUGGESTED) | Met — public evidence | GitHub release/tag `v0.2.0`. |
| `release_notes` | Met — public evidence | `CHANGELOG.md` provides human-readable release summaries; GitHub release `v0.2.0` links the released changes. |
| `release_notes_vulns` | N/A candidate for current release | No publicly known project vulnerability with a CVE/comparable identifier was fixed in `v0.2.0`. `SECURITY.md` now requires future release notes/advisories to identify affected/fixed versions and any identifier that exists at release time. |

## Reporting

| Criterion | Status | Evidence / justification |
| --- | --- | --- |
| `report_process` | Met — public evidence | `CONTRIBUTING.md` directs non-sensitive defects to GitHub Issues and gives reproduction requirements. |
| `report_tracker` (SHOULD) | Met — public evidence | GitHub Issues. |
| `report_responses` | Manual attestation | BadgeApp asks about the majority of bug reports in a 2–12 month historical window. The repository was created in August 2026; do not fabricate a longer history. Answer from the actual issue archive when completing the form. |
| `enhancement_responses` (SHOULD) | Manual attestation | Same new-project/history caveat; answer from actual issue history. |
| `report_archive` | Met — public evidence | Public GitHub Issues/PR archive. |
| `vulnerability_report_process` | Met — public evidence | `SECURITY.md` publishes the security-reporting process. |
| `vulnerability_report_private` | Met — public evidence | `SECURITY.md` now gives GitHub private vulnerability reporting when enabled and a direct private fallback at `contact@healthrenewal.org`, plus rules for high-sensitivity evidence. |
| `vulnerability_report_response` | N/A candidate until a report exists | `SECURITY.md` establishes a ≤14-day acknowledgement target. If a vulnerability was actually reported within six months, answer from the real timestamps; otherwise the official criterion permits N/A. |

## Quality

| Criterion | Status | Evidence / justification |
| --- | --- | --- |
| `build` | Met — public evidence | `npm run build`; clean packed-consumer and reproducible-build gates exist. |
| `build_common_tools` (SUGGESTED) | Met — public evidence | Standard Node/npm scripts and TypeScript tooling. |
| `build_floss_tools` (SHOULD) | Met — public evidence | Build/test stack is composed of FLOSS tools listed in `package.json`. Hosted GitHub Actions is not required to build locally. |
| `test` | Met — public evidence | Vitest tests plus Playwright/axe browser suite; commands documented in README/CONTRIBUTING and CI. |
| `test_invocation` (SHOULD) | Met — public evidence | Standard `npm test`, `npm run check`, `npm run test:e2e`. |
| `test_most` (SUGGESTED) | Considered; do not overclaim coverage | The project has broad unit, package-contract and real-browser matrices, but no claim of quantified near-total branch coverage is made. |
| `test_continuous_integration` (SUGGESTED) | Met — public evidence | `.github/workflows/ci.yml` executes on pushes/PRs; Node 22/24/26 and browser checks are public. |
| `test_policy` | Met — public evidence | `CONTRIBUTING.md` requires tests for success, failure and counterexamples and requires PRs to explain test coverage. |
| `tests_are_added` | Met — public evidence | `CHANGELOG.md` and repository history show tests added alongside recent Intl, typeahead, selection, grid, digit-system, Unicode and browser functionality. |
| `tests_documented_added` (SUGGESTED) | Met — public evidence | Explicit in `CONTRIBUTING.md`. |
| `warnings` | Met — public evidence | ESLint gate with `--max-warnings=0`; strict TypeScript compile gate. |
| `warnings_fixed` | Met — public evidence | `npm run check` fails on lint warnings/type errors and is exercised in CI. |
| `warnings_strict` (SUGGESTED) | Met — public evidence | `tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports`; ESLint allows zero warnings. |

## Security

| Criterion | Status | Evidence / justification |
| --- | --- | --- |
| `know_secure_design` | Manual attestation | This criterion is about a primary developer's knowledge. `docs/THREAT-MODEL.md`, least-privilege workflow changes, scope controls and security policy demonstrate applied practice, but the maintainer must personally attest the knowledge requirement. |
| `know_common_errors` | Manual attestation | Same principle: security docs and tests are supporting evidence, but do not convert repository prose into a claim about a person's knowledge. |
| `crypto_published` | N/A candidate | Toolkit does not implement a cryptographic protocol/algorithm. Release-integrity hashing uses standard platform/OpenSSL tooling, not custom cryptography. |
| `crypto_call` (SHOULD) | N/A candidate | Toolkit's primary purpose is not cryptography and it does not implement crypto primitives. |
| `crypto_floss` | N/A candidate | No package functionality depends on proprietary cryptography. |
| `crypto_keylength` | N/A candidate | No toolkit cryptographic key-management mechanism. |
| `crypto_working` | N/A candidate | No custom encryption/cipher mode. |
| `crypto_weaknesses` (SHOULD) | N/A candidate | No custom crypto. |
| `crypto_pfs` (SHOULD) | N/A candidate | No key-agreement/session protocol. |
| `crypto_password_storage` | N/A candidate | Library does not authenticate external users or store passwords. |
| `crypto_random` | N/A candidate | Library does not generate cryptographic keys/nonces. |
| `delivery_mitm` | Met — public evidence | Source and GitHub release delivery use HTTPS. npm publication must remain unclaimed until #90 is resolved. |
| `delivery_unsigned` | Met — public evidence | The project does not instruct users to fetch an unauthenticated hash over HTTP; release design uses HTTPS and exact SHA-512 registry identity/provenance when npm publication is active. |
| `vulnerabilities_fixed_60_days` | Met based on current public evidence | No known unpatched medium-or-higher project vulnerability is identified in the public repository/advisory surface. Reassess at BadgeApp submission time. |
| `vulnerabilities_critical_fixed` (SHOULD) | Met as policy/current state | `SECURITY.md` and remediation policy require coordinated remediation; no known critical project vulnerability is currently recorded. Reassess at submission. |
| `no_leaked_credentials` | Met — public evidence | Scope/secret guard, public-scope policy, Scorecard and repository checks are in place; current Scorecard reports no dangerous credential leakage finding. This is always subject to re-checking immediately before submission. |

## Analysis

| Criterion | Status | Evidence / justification |
| --- | --- | --- |
| `static_analysis` | Met — public evidence | CodeQL plus strict TypeScript/ESLint and release quality gate. CodeQL runs on push/PR/schedule. |
| `static_analysis_common_vulnerabilities` (SUGGESTED) | Met — public evidence | CodeQL security queries are specifically designed to detect vulnerability classes in JavaScript/TypeScript. |
| `static_analysis_fixed` | Met based on current public evidence | No confirmed medium-or-higher exploitable CodeQL finding is left documented as accepted debt. Reassess current CodeQL alerts when submitting. |
| `static_analysis_often` (SUGGESTED) | Met — public evidence | CodeQL runs on pushes and pull requests to `main`, plus schedule. |
| `dynamic_analysis` (SUGGESTED) | Considered; conservative answer | Playwright executes real Chromium/Firefox/WebKit/mobile browser behavior and axe accessibility checks, but the project does not claim ≥80% branch coverage or a dedicated security fuzzer. Do not claim this criterion solely to improve a badge. |
| `dynamic_analysis_unsafe` | N/A candidate | Production library is TypeScript/JavaScript, not a memory-unsafe implementation language such as C/C++. |
| `dynamic_analysis_enable_assertions` (SUGGESTED) | Considered | Test/package contract suites make explicit invariant assertions; no claim is made about a special production assertion mode. |
| `dynamic_analysis_fixed` | N/A candidate unless such analysis finds a vulnerability | If a future dynamic/fuzzing tool finds an exploitable issue, track remediation under the security policy instead of keeping this N/A. |

## Account-bound and submission-time checks

Before opening or completing the BadgeApp record, perform these checks from authenticated service accounts:

1. Verify GitHub private vulnerability reporting is enabled if the project intends to cite that channel; the email fallback in `SECURITY.md` remains valid independently.
2. Re-check open CodeQL/security alerts and public vulnerability advisories.
3. Review actual issue-response history for `report_responses` and `enhancement_responses` without inventing a pre-project history.
4. The primary maintainer personally answers `know_secure_design` and `know_common_errors`.
5. Confirm all project/repository/download links cited in the BadgeApp form resolve over HTTPS.
6. If the badge is awarded, add the **actual BadgeApp-provided badge/link** to the repository/site within the program's required timeframe. Never pre-create a success badge.

## Separate hardening work not required to fake Passing

- `main` branch protection/ruleset enforcement remains tracked in #88. It is important security posture even though the Passing criteria above should be answered independently from Scorecard's automated branch-protection check.
- npm first-publication bootstrap remains tracked in #90.
- Multi-maintainer/bus-factor and independent review are real maturity goals; do not manufacture contributors or approvals to satisfy higher levels or automated metrics.
- Dedicated fuzzing/coverage work should be added only when it materially improves defect discovery for bidi/Unicode/locale invariants.

## Submission boundary

This evidence map may be used to prepare answers, but the actual self-certification is an authenticated action on `bestpractices.dev` and must be completed from the project's maintainer account. A public BadgeApp record is the only source of truth for whether Passing has been achieved.
