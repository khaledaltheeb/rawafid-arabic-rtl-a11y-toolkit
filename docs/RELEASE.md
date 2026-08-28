# Release and publication policy

## Goals

Releases must originate from reviewed public source, minimize credential exposure, preserve exact artifact identity, fail closed on registry mismatch, and produce verifiable supply-chain evidence.

## Permanent release model

Routine versions use npm Trusted Publishing/OIDC from `.github/workflows/release.yml`. The permanent publication path uses a GitHub-hosted runner, the protected `npm` environment, `id-token: write`, and no long-lived npm publication token. It publishes one exact prebuilt tarball and then requires npm `dist.integrity` to equal the locally computed SHA-512 integrity.

The repository also produces retained release evidence: deterministic installation, the complete `npm run check` gate, package-content inspection, SPDX SBOM, reproducible public review surface, and GitHub artifact attestations.

## Why v0.3.0 requires a one-time bootstrap

The first OIDC publication attempt on 2026-08-28 proved that the GitHub-to-npm OIDC path could obtain a CI identity and sign a provenance statement, but npm rejected creation of `@rawafid/arabic-rtl-a11y-toolkit@0.3.0` with registry HTTP 404 because the package did not yet exist / the new scoped package had not yet been created under an authorized registry identity.

npm Trusted Publisher configuration is package-scoped and the package must already exist before that trust relationship can be configured. Therefore first package creation is a bootstrap exception, not the routine release model.

## First-package bootstrap design

The temporary `main` push path in `release.yml` is limited to changes to `release.yml`, the canonical repository, the exact package `@rawafid/arabic-rtl-a11y-toolkit`, and exact version `0.3.0`.

The workflow deliberately separates three security domains:

1. **Prepare evidence — no npm credential and no OIDC write permission.** It checks out the exact release commit, validates package/tag identity, requires the committed lockfile, runs deterministic `npm ci`, runs the complete `npm run check` gate, inspects package contents, builds one exact tarball, computes SHA-512 integrity, generates an SPDX SBOM, rebuilds the review surface, checks whether the registry version already exists, and uploads retained evidence.
2. **Create the initial npm package — token authentication only.** The `bootstrap-initial-package` job uses the GitHub Environment secret `rawafid1` only when `0.3.0` is not already present. The job intentionally does **not** have `id-token: write` or `attestations: write`, so npm cannot prefer Trusted Publishing over the bootstrap token. It verifies that the token authenticates with `npm whoami`, performs a best-effort ownership/membership check for the `rawafid` scope, publishes the exact tarball with public access and `--provenance=false`, and then requires registry `dist.integrity` to match the exact local tarball.
3. **Attest and bind the release — OIDC after registry verification, without the npm token.** A separate job runs only after the bootstrap publication job succeeds. It receives `id-token: write`, creates GitHub attestations for the tarball, SBOM, and public review surface, and only then creates/updates the matching `v0.3.0` GitHub Release and attaches release assets.

The bootstrap token is never committed, printed, passed to pull-request workflows, or made available to the attestation job.

## Bootstrap credential requirements

`rawafid1` must be an npm Granular Access Token stored under the GitHub Environment named `npm`. It must have only the package/scope rights required for the intended publication. For automated direct publishing, npm currently requires write access and a token configuration compatible with the account/package 2FA policy, including Bypass 2FA when required.

The token cannot grant rights the underlying npm user does not have. The publishing identity must own the `rawafid` user scope or be authorized to publish packages in the `rawafid` npm organization. If registry authorization fails, do not rename the package merely to bypass ownership controls; fix the namespace ownership/permission issue.

## Provenance boundary for the bootstrap version

Do **not** claim npm Trusted Publishing provenance for the token-created `0.3.0` package. The token bootstrap disables npm provenance intentionally because the job has no OIDC permission. This is necessary to force traditional authentication for creation of a package that cannot yet have a package-level Trusted Publisher.

The bootstrap still receives post-publication GitHub attestations from a separate OIDC-enabled job after registry identity has been verified. These GitHub attestations are supply-chain evidence, but they are not a substitute for an npm Trusted Publishing provenance badge/statement on the bootstrap publication itself.

Routine versions published after Trusted Publisher configuration use OIDC and npm provenance.

## Mandatory transition after first package creation

Once `@rawafid/arabic-rtl-a11y-toolkit@0.3.0` exists and its registry integrity has been verified:

1. Open the npm package settings and configure its GitHub Actions Trusted Publisher.
2. Use GitHub owner/user `khaledaltheeb`.
3. Use repository `rawafid-arabic-rtl-a11y-toolkit`.
4. Use workflow filename `release.yml` exactly.
5. Use GitHub Environment `npm` if the npm configuration includes an environment restriction.
6. Allow direct `npm publish` for the routine release workflow, unless the project deliberately adopts staged publishing later.
7. Remove the one-time `push` bootstrap trigger and all `rawafid1` references from `release.yml`.
8. Restore the permanent release workflow to `release: published` only and OIDC-only publication.
9. Revoke/remove the bootstrap token when it has no remaining legitimate use.
10. Prove the permanent path with the next release and verify npm provenance plus exact registry integrity.

## Routine release sequence

After bootstrap cleanup:

1. Prepare version and release notes in a reviewed PR.
2. Require CI, CodeQL, Dependency Review, package contract gates, and browser/accessibility evidence to pass.
3. Merge the intended release commit to `main`.
4. Create the matching Git tag and GitHub Release through a maintainer-controlled action capable of emitting the `release` event.
5. `release.yml` installs from the committed lockfile and reruns the complete release gate.
6. It builds one exact tarball, SPDX SBOM, and reproducible review artifact.
7. npm publishes through OIDC Trusted Publishing with provenance and without a publication token.
8. Registry `dist.integrity` must equal the exact locally computed tarball integrity.
9. GitHub attestations are generated from the retained evidence.
10. Verify clean-consumer installation/import and published metadata.

GitHub suppresses most new workflow runs caused by events created using a repository `GITHUB_TOKEN`. The first-package bootstrap therefore completes its registry verification, GitHub attestations, and release binding within its own workflow rather than assuming its generated GitHub Release will launch another workflow.

## Owner-controlled hardening still open

GitHub `main` branch/ruleset protection remains an observed owner-level gap. Until it is enabled, reviewed PRs and green checks are compensating controls only; they do not satisfy the missing branch-protection requirement itself. Do not represent OpenSSF branch-protection requirements as satisfied until the repository settings are actually changed.

## Versioning and rollback

The project follows SemVer. npm versions are immutable. Never silently replace an already published version. If a release is defective, deprecate it where appropriate and publish a corrected new version. Security incidents follow `SECURITY.md` and may require coordinated disclosure.

## References

- npm Trusted Publishers: https://docs.npmjs.com/trusted-publishers/
- npm trust CLI and package-existence requirement: https://docs.npmjs.com/cli/v11/commands/npm-trust/
- npm access tokens: https://docs.npmjs.com/about-access-tokens/
