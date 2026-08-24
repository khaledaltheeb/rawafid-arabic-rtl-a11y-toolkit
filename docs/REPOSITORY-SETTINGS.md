# Required repository settings

These controls cannot be encoded completely in Git and must be configured after the independent GitHub repository is created.

## Repository

- Visibility: **Public**.
- Default branch: `main`.
- Enable Issues.
- Enable private vulnerability reporting.
- Enable Dependabot alerts and security updates.
- Enable secret scanning and push protection where available.
- Enable dependency graph.

## Ruleset for `main`

Recommended minimum:

- Require pull requests before merge.
- Require at least one approving review; raise to two when additional maintainers exist.
- Dismiss stale approvals when new commits are pushed.
- Require review from CODEOWNERS for owned paths.
- Require conversation resolution.
- Block force pushes.
- Block branch deletion.
- Require status checks from CI, CodeQL, Dependency Review, and scope/package gates as they become available.
- Require branches to be up to date before merge where practical.
- Restrict bypass privileges to the minimum maintainer set.

Signed commits/tags are recommended when the maintainer's signing workflow is established; do not enable a requirement before maintainers can satisfy it reliably.

## Actions

- Default workflow token permission: read repository contents.
- Do not grant write permissions globally.
- Allow only required actions, with third-party actions pinned to full commit SHAs.
- Review workflow changes as security-sensitive code.

## npm environment

Create an environment named `npm` for the publication job. Optionally require a reviewer for production releases. No npm token secret is required when Trusted Publishing is configured.

## npm trusted publisher

Authorize exactly:

- repository: `khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit`
- workflow: `.github/workflows/release.yml`
- environment: `npm`, if npm configuration requests it

## Topics

Suggested GitHub topics:

`arabic`, `rtl`, `bidi`, `i18n`, `localization`, `accessibility`, `a11y`, `unicode`, `typescript`, `logical-properties`, `playwright`, `wcag`
