# Release and publication policy

## Current state

`@rawafid/arabic-rtl-a11y-toolkit@0.3.0` was first published to npm on 2026-08-28 and then independently verified against the exact locally built tarball. GitHub Release `v0.3.0` was created on the verified release commit with the tarball, SPDX SBOM, release notes, and post-publication GitHub attestations.

The one-time token bootstrap is complete and retired from repository workflows. Routine releases use npm Trusted Publishing/OIDC only. No long-lived npm publication token is referenced by `.github/workflows/release.yml`.

## Permanent release model

Routine versions use npm Trusted Publishing/OIDC from `.github/workflows/release.yml`. The publication job runs on a GitHub-hosted runner, references the protected `npm` Environment, receives `id-token: write`, and does not receive `NODE_AUTH_TOKEN` or any npm access-token secret.

The workflow publishes one exact prebuilt tarball with npm provenance, then queries the public npm registry without publication credentials and requires `dist.integrity` to equal the locally computed SHA-512 value. Registry mismatch is fail-closed.

Release evidence is produced before publication without npm credentials or OIDC write permission:

- deterministic installation from the committed lockfile;
- the complete `npm run check` gate;
- package-content inspection with `npm pack --dry-run`;
- one exact tarball plus locally computed SHA-512 integrity;
- SPDX SBOM;
- reproducible public review surface;
- retained workflow artifact evidence.

After registry identity is proven, a separate OIDC-enabled job creates GitHub attestations for the tarball, SBOM, and public review surface.

## Routine release sequence

1. Prepare the version and release notes in a reviewed pull request.
2. Require CI, CodeQL, Dependency Review, package-contract gates, and browser/accessibility evidence to pass.
3. Merge the intended release commit to `main`.
4. Create the matching Git tag and publish the GitHub Release.
5. `release.yml` checks out that exact tag and requires it to match `package.json`.
6. It reruns deterministic installation and the complete release-candidate gate.
7. It builds one exact tarball, SPDX SBOM, and reproducible review artifact.
8. If the exact npm version does not already exist, npm publishes through Trusted Publishing/OIDC with provenance and without a publication token.
9. Public-registry `dist.integrity` must equal the exact locally computed tarball integrity.
10. GitHub attestations are generated only after the registry identity check succeeds.
11. Verify clean-consumer installation/import and published metadata.

An already-published npm version is never replaced. A workflow rerun may verify an existing version, but it must not republish it.

## v0.3.0 bootstrap record

The first package creation required a one-time npm Granular Access Token because the package did not yet exist. The bootstrap was deliberately isolated from OIDC publication permissions, used the exact prebuilt `0.3.0` tarball, and disabled npm provenance for that token-authenticated publish.

The bootstrap run authenticated an authorized member of the npm `rawafid` organization, published `@rawafid/arabic-rtl-a11y-toolkit@0.3.0`, and later verified the public registry artifact against the local SHA-512 integrity. A separate GitHub OIDC job then created three GitHub attestations and GitHub Release `v0.3.0`.

This historical boundary matters: do **not** claim that npm package version `0.3.0` itself was published through npm Trusted Publishing provenance. It was token-bootstrapped. The GitHub attestations attached to the release are separate supply-chain evidence.

`docs/FIRST-PUBLICATION.md` retains the detailed historical bootstrap record. The bootstrap jobs and the `rawafid1` secret reference are no longer part of the permanent release workflow.

## Credential policy

The permanent release workflow must not contain:

- `NODE_AUTH_TOKEN`;
- `secrets.rawafid1` or any other npm publication-token secret;
- a push-triggered publication path;
- a duplicate bootstrap workflow;
- publication from an unreviewed source artifact.

Account-level 2FA should remain enabled. Any temporary credential created solely for the first publication should be revoked or removed once it has no remaining legitimate use.

## Release preflight

`.github/workflows/release-preflight.yml` is nonpublishing and manual. It may build release evidence, but it must not receive OIDC publication permission, run `npm publish`, or create release attestations. Its role is to validate the candidate before a maintainer publishes the matching GitHub Release.

## Owner-controlled hardening still open

GitHub `main` branch/ruleset protection remains an observed owner-level gap. Until it is enabled, reviewed PRs and green checks are compensating controls only; they do not satisfy the missing branch-protection requirement itself. Do not represent OpenSSF branch-protection requirements as satisfied until the repository settings are actually changed.

Recommended repository protection remains:

- require pull requests for `main`;
- require CI, CodeQL, and Dependency Review;
- block force pushes and branch deletion;
- prevent direct commits to the protected primary branch.

## Versioning and rollback

The project follows SemVer. npm versions are immutable. Never silently replace an already published version. If a release is defective, deprecate it where appropriate and publish a corrected new version. Security incidents follow `SECURITY.md` and may require coordinated disclosure.

## References

- npm Trusted Publishers: https://docs.npmjs.com/trusted-publishers/
- npm trust CLI: https://docs.npmjs.com/cli/v11/commands/npm-trust/
- npm access tokens: https://docs.npmjs.com/about-access-tokens/
