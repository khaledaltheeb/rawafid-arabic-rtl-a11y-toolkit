# Required repository settings

These controls cannot be encoded completely in Git and must be configured in the GitHub/npm account interfaces. Repository files may document the intended policy, but they are not evidence that an account-bound setting is enabled.

## Observed service state — 2026-08-29

The following state was read directly from the GitHub service after the public `v0.3.0` release and README cleanup:

- Visibility: **Public**.
- Default branch: `main`.
- `main` branch protection/ruleset enforcement: **not enabled** (`protected: false`).
- Required status-check enforcement on `main`: **off**.
- Issues: enabled.
- Discussions: disabled.
- Wiki: enabled.
- Projects: enabled.
- Automatically delete head branches after merge: disabled.
- Repository homepage: not configured.
- Repository topics: none configured.

The branch-protection state is the material governance gap. Green CI and reviewed pull requests are useful compensating controls, but they do not satisfy a requirement to prevent direct changes to the primary branch.

## Repository target state

- Keep visibility **Public**.
- Keep the default branch as `main`.
- Keep Issues enabled.
- Enable Discussions for maintainer/community questions that are not bug reports.
- Disable Wiki unless a separate wiki is deliberately maintained; canonical technical documentation belongs in versioned repository files.
- Disable Projects until there is an active project board with an owner and operating cadence.
- Automatically delete head branches after pull requests are merged.
- Set the repository homepage to the public Rawafid toolkit adoption/evidence page once that production page is live.
- Add the documented repository topics.
- Enable private vulnerability reporting.
- Enable Dependabot alerts and security updates.
- Enable secret scanning and push protection where available.
- Enable Dependency Graph.

## Ruleset for `main`

Required minimum target:

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

The publication workflow uses the GitHub environment named `npm`. A long-lived npm publication token is not part of the permanent release workflow.

The one-time GitHub Environment secret `rawafid1` was used only for the completed first-package bootstrap. The permanent workflow no longer references it. Remove the Environment secret and revoke the underlying npm token once there is no other legitimate use for that credential.

## First npm publication — completed

The first public package creation is complete. `@rawafid/arabic-rtl-a11y-toolkit@0.3.0` was created through an isolated one-time npm Granular Access Token bootstrap with npm provenance disabled, then independently verified against registry `dist.integrity`. Separate GitHub attestations and GitHub Release `v0.3.0` were created only after that registry identity check succeeded.

See [`FIRST-PUBLICATION.md`](./FIRST-PUBLICATION.md) for the immutable audit record. Do not describe `v0.3.0` as an npm Trusted Publishing provenance release.

## npm Trusted Publisher after bootstrap

The permanent repository workflow is OIDC-only and is designed to publish through npm Trusted Publishing. The package-level npm account setting is external to this repository and cannot be inferred from `release.yml` alone.

Authorize exactly:

- GitHub user/organization: `khaledaltheeb`
- repository: `rawafid-arabic-rtl-a11y-toolkit`
- workflow filename: `release.yml`
- environment: `npm` when using the GitHub deployment environment binding
- allowed operation: `npm publish` unless a deliberately stricter staged-publishing policy is adopted

npm's Trusted Publisher form expects the workflow **filename**, not `.github/workflows/release.yml`.

Treat the Trusted Publisher relationship as unproven until it is verified in npm account settings or demonstrated by a successful legitimate OIDC publication of a later release. After that proof, keep traditional publication access at the strongest policy compatible with the release process and remove credentials that are no longer needed.

## Topics

Suggested GitHub topics:

`arabic`, `rtl`, `bidi`, `i18n`, `localization`, `accessibility`, `a11y`, `unicode`, `typescript`, `logical-properties`, `playwright`, `wcag`, `sarif`, `github-actions`
