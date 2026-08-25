# Open-source application dossier

This dossier is the reusable evidence pack for infrastructure, localization, developer-tooling, accessibility, and open-source program applications involving the **Rawafid Arabic/RTL Accessibility & Localization Toolkit**.

It exists to make applications accurate, consistent, and reviewable. It is not evidence that any provider has approved the project. Provider terms can change; the applicant must re-check the provider's current official criteria immediately before submission.

**Criteria review date:** 2026-08-25

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
| Project scope | Reusable Arabic/RTL, bidi, i18n, accessibility, Unicode/text, interaction, CSS, and verification infrastructure |

Use `docs/PROJECT-IDENTITY.md` as the canonical identity policy and `OPEN_SOURCE_SCOPE.md` as the repository publication boundary.

## Evidence index

Applications should link reviewers directly to evidence instead of relying on broad claims.

| Reviewer question | Repository evidence |
| --- | --- |
| Is the source public and reusable? | `README.md`, `OPEN_SOURCE_SCOPE.md`, `LICENSE` |
| Is the license OSI-compatible for typical OSS programs? | Apache-2.0 `LICENSE`, `NOTICE` |
| Is development active? | Git history, pull requests, `CHANGELOG.md`, `ROADMAP.md` |
| Is there a contribution process? | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, issue/PR templates |
| Is security treated seriously? | `SECURITY.md`, `docs/THREAT-MODEL.md`, CodeQL, Dependency Review, OpenSSF Scorecard, action-pin guard |
| Are releases reproducible/reviewable? | `.github/workflows/release.yml`, package-artifact checks, reproducible-build check, SBOM generation, npm provenance design |
| Is cross-browser infrastructure genuinely useful? | `playwright.config.ts`, `tests/e2e/`, browser matrix in CI |
| Is accessibility a real engineering surface? | `src/a11y/`, axe-core regression tests, RTL keyboard/grid/typeahead behavior, `styles/a11y.css` |
| Is localization a real engineering surface? | `src/i18n/`, `locales/`, catalog validator, pseudo-localization, locale negotiation and formatting APIs |
| Is Arabic/RTL support substantive rather than cosmetic? | `src/rtl/`, `src/text/`, bidi isolation/control handling, script-aware direction, logical CSS, localized-number parsing |
| Is the package API governed? | `api/public-api.json`, `api/public-types.sha256`, `docs/PUBLIC-API.md`, documentation contract gate |
| Is private Rawafid content excluded? | `OPEN_SOURCE_SCOPE.md`, scope guard, clean-room extraction rule |

## Provider-specific fit

The entries below describe fit, not approval. Re-check the linked official program before applying.

### BrowserStack Open Source

Official program: https://www.browserstack.com/open-source

Strong fit signals:

- the project is public and Apache-2.0 licensed;
- browser interoperability is a first-class requirement rather than a marketing add-on;
- Playwright already validates Chromium, Firefox, WebKit, and mobile-oriented scenarios;
- RTL, bidi, localized input, accessibility, keyboard interactions, and layout behavior are specifically prone to browser differences;
- additional real-device and visual-regression coverage would produce direct public engineering value.

Application emphasis: explain the concrete cross-browser problem set and point reviewers to `tests/e2e/`, `playwright.config.ts`, and the CI browser job.

Do not claim BrowserStack execution until credentials/integration and observed runs exist.

### Transifex Open Source

Official program: https://www.transifex.com/open-source/

Current published eligibility language requires publicly available source code under an OSI-approved license and no funding, revenue, or commercialization model for the qualifying open-source project.

Repository fit signals:

- public Apache-2.0 source;
- real localization catalogs and catalog QA;
- locale negotiation, pseudo-localization, formatting, pluralization, display-name, and localized-input code;
- contribution/governance structure appropriate for community localization.

Critical application gate: confirm truthfully at submission time that the **toolkit project itself** satisfies Transifex's then-current funding/revenue/commercialization criteria. Do not infer eligibility merely because Rawafid's broader platform and this toolkit have separate scopes.

### Weblate Libre hosting

Official project: https://weblate.org/
Hosted documentation: https://docs.weblate.org/

Weblate documents a gratis Libre plan for qualifying public projects. The toolkit is technically suitable because its translation resources are public, version-controlled, and independently reusable.

Application/integration emphasis:

- keep translation components public;
- use repository-backed synchronization;
- preserve catalog validation in CI so translation-platform changes cannot bypass key/placeholder/bidi checks.

Do not commit hosted-service project identifiers, credentials, or configuration until the corresponding Weblate project actually exists.

### JetBrains Open Source

Official OSS information: https://www.jetbrains.com/community/opensource/

JetBrains offers open-source development licensing/collaboration routes subject to its current eligibility rules. Strong evidence here is the project being an active developer-facing TypeScript library with a public OSI-approved license, sustained maintenance, tests, releases, and a contribution model.

Application emphasis: position the toolkit as developer infrastructure for a globally under-served engineering domain—Arabic/RTL accessibility and localization—not as a private Rawafid application.

### GitLab for Open Source

Official program documentation: https://docs.gitlab.com/subscriptions/community_programs/

GitLab's current published criteria include public visibility, OSI-approved licensing, and program-specific non-profit-seeking requirements for the applying namespace.

The repository already includes `.gitlab-ci.yml`, which demonstrates portability rather than dependence on GitHub-only CI.

Critical application gate: GitLab evaluates the applying GitLab namespace, not merely this GitHub repository. Before applying, create/use a public GitLab namespace whose projects all satisfy the program's current requirements, then mirror/import this project there if that remains strategically useful.

### Sentry and other providers

Do not assume a current sponsored/open-source plan exists simply because a vendor supports open source historically. For Sentry, TestMu, Docker, or any other provider, find the provider's current official program page and eligibility terms before naming a specific benefit in an application.

A provider can still be a useful technical integration partner even when no dedicated OSS sponsorship program is currently verified.

## Application narrative

Keep the application factual and engineering-led:

> Rawafid Arabic/RTL Accessibility & Localization Toolkit is a public Apache-2.0 TypeScript project that provides framework-agnostic infrastructure for bidirectional web interfaces, Arabic and multilingual localization, accessibility interactions, Unicode-safe text handling, localized numeric input, and browser verification. The project has zero runtime dependencies and uses deterministic CI, package-contract checks, CodeQL, dependency review, OpenSSF Scorecard, cross-browser Playwright tests, axe-core accessibility regression testing, API-surface governance, and an explicit clean-room boundary separating reusable software from Rawafid's scientific/editorial content. The requested program resources would be used directly to improve publicly available interoperability, localization, accessibility, or developer-tooling evidence.

Adjust the final sentence to the provider. Do not change factual eligibility answers to improve acceptance odds.

## Rejection-risk controls

Before submitting any application:

1. Confirm the provider's criteria on its current official site.
2. Confirm the repository is public and the default branch is healthy.
3. Confirm `LICENSE`, `NOTICE`, `README.md`, contribution/governance/security files, and relevant test evidence are visible.
4. Confirm the latest relevant CI/security run is green; never cite an older run as evidence for a newer commit.
5. Confirm the exact commercial/funding status requested by that provider.
6. Use the canonical Rawafid/project/domain names exactly as defined in `docs/PROJECT-IDENTITY.md`.
7. Link directly to the repository evidence that justifies the requested benefit.
8. State how the provider's resource will improve the public project rather than Rawafid's private or scientific systems.
9. Do not claim users, downloads, contributors, coverage percentages, certifications, sponsorships, or integrations that have not been observed.
10. Keep credentials and account-bound configuration outside Git; add provider-specific CI only after the account/integration exists.

## Evidence that remains external

Repository quality cannot prove account-bound states. See `docs/VERIFICATION-STATUS.md` for the authoritative list, including branch/ruleset protection, npm ownership and 2FA, first npm publication, Trusted Publisher binding, and external program approvals.
