# Required repository settings

These controls cannot be encoded completely in Git and must be configured in the GitHub/npm account interfaces.

## Repository

- Visibility: **Public**.
- Default branch: `main`.
- Enable Issues.
- Enable Discussions for maintainer/community questions that are not bug reports.
- Disable Wiki unless a separate wiki is deliberately maintained; canonical technical documentation belongs in versioned repository files.
- Disable Projects until there is an active project board with an owner and operating cadence.
- Automatically delete head branches after pull requests are merged.
- Enable private vulnerability reporting.
- Enable Dependabot alerts and security updates.
- Enable secret scanning and push protection where available.
- Enable Dependency Graph.

## Ruleset for `main`

Recommended minimum:

- Require pull requests before merge.
- Require at least one approving review; raise to two when additional maintainers exist.
- Dismiss stale approvals when new commits are pushed.
- Require review from CODEOWNERS for owned paths when more than one eligible reviewer exists.
- Require conversation resolution.
- Block force pushes.
- Block branch deletion.
- Require status checks from CI, CodeQL, Dependency Review, and relevant scope/package gates.
- Require branches to be up to date before merge where practical.
- Restrict bypass privileges to the minimum maintainer set.

Signed commits/tags are recommended when the maintainer's signing workflow is established; do not enable a requirement before maintainers can satisfy it reliably.

## Actions

- Default workflow token permission: read repository contents.
- Do not grant write permissions globally.
- Allow only required actions, with third-party actions pinned to full immutable commit SHAs.
- Review workflow changes as security-sensitive code.

## npm environment

Create a GitHub environment named `npm` for the publication job. Optionally require a reviewer for production releases. No npm publication token secret is required for routine releases after Trusted Publishing is configured.

## First npm publication

A brand-new npm package must exist before npm Trusted Publishing can be configured. Follow `docs/FIRST-PUBLICATION.md`: perform the one-time interactive 2FA-protected bootstrap publication from a trusted maintainer machine, then configure Trusted Publishing immediately.

Do not add a long-lived or bypass-2FA npm publication token to GitHub as a workaround for the bootstrap requirement.

## npm Trusted Publisher after bootstrap

Authorize exactly:

- GitHub user/organization: `khaledaltheeb`
- repository: `rawafid-arabic-rtl-a11y-toolkit`
- workflow filename: `release.yml`
- environment: `npm` when using the GitHub deployment environment binding
- allowed operation: `npm publish` unless a deliberately stricter staged-publishing policy is adopted

npm's Trusted Publisher form expects the workflow **filename**, not `.github/workflows/release.yml`.

After an OIDC publication succeeds, restrict traditional publication access to the strongest policy compatible with the chosen release process and remove credentials that are no longer needed.

## Topics

Suggested GitHub topics:

`arabic`, `rtl`, `bidi`, `i18n`, `localization`, `accessibility`, `a11y`, `unicode`, `typescript`, `logical-properties`, `playwright`, `wcag`
