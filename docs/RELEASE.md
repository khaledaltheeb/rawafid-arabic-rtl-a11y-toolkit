# Release and publication policy

## Goals

Releases must originate from reviewed public source, be reproducible enough to audit, minimize credential exposure, preserve exact artifact identity, and carry provenance whenever the registry supports it.

## Current readiness state

The independent public GitHub repository and committed `package-lock.json` are in place. The repository has live CI across Node 22, 24, and 26; Playwright browser coverage; CodeQL; Dependency Review; package-shape and packed-consumer validation; reproducible-build checks; SPDX SBOM generation; and a release workflow designed for npm Trusted Publishing/OIDC.

The remaining owner-controlled hardening items include GitHub branch/ruleset protection, some repository security settings, and npm Trusted Publisher configuration after the package exists. These remain visible gaps and are not to be represented as completed until they are actually enabled.

## First-publication bootstrap constraint

A brand-new npm package may need a traditional registry credential before the package can be associated with a Trusted Publisher. For that one-time creation only, this repository permits a temporary token-assisted bootstrap workflow under the following constraints:

1. The credential is an npm granular access token stored only as a GitHub Actions secret; it is never committed or printed.
2. The workflow is limited to the canonical repository and a single exact bootstrap version.
3. It triggers only from the version-changing push to `main`, never from `pull_request` or untrusted code.
4. Deterministic install and the complete `npm run check` quality gate execute before the credentialed publish step.
5. The exact tarball is built once, its SHA-512 integrity is computed locally, and an SPDX SBOM is retained.
6. Publication uses the exact tarball with `--access public --provenance` from a GitHub-hosted runner with `id-token: write`.
7. Registry `dist.integrity` must match the locally computed tarball integrity before a GitHub Release is created.
8. The temporary bootstrap workflow is removed after successful package creation.
9. npm Trusted Publishing is configured for `.github/workflows/release.yml` immediately after bootstrap, and the bootstrap token is revoked when no longer required.

See `docs/FIRST-PUBLICATION.md` for the operational checklist.

## Preconditions for a bootstrap release

Before the first npm publication:

1. Confirm the npm package name/scope is available and controlled by the maintainer. An organization-scoped package such as `@rawafid/...` requires write access to the corresponding npm organization/scope.
2. Confirm npm account and publishing 2FA policy is satisfied and the granular bootstrap token has only the permissions required for the intended package/scope.
3. Verify that the release version in `package.json` and the planned Git tag/GitHub Release match.
4. Run the complete CI/security matrix on the release PR and merge only after CI, CodeQL, Dependency Review, package gates, and browser evidence are green.
5. Review `npm pack --dry-run` behavior and ensure no excluded Rawafid content, secrets, local artifacts, or private material can enter the package.
6. Keep the known GitHub branch/ruleset protection gap explicitly documented until it is fixed. While that owner-level setting remains unavailable to automation, the bootstrap release must use a reviewed PR and green checks as compensating controls; this does not satisfy the missing protection requirement itself.
7. Publish only through the locked one-time bootstrap workflow described above.
8. Configure npm Trusted Publishing after the package exists and remove the bootstrap workflow/credential path.

The automated release workflows fail closed if `package-lock.json` is absent or release identity does not match the expected package version.

## Authentication after bootstrap

Routine publication uses npm Trusted Publishing via OIDC. The permanent `.github/workflows/release.yml` must not require a long-lived npm publication token. It requests `id-token: write` only for the publish job and retains the exact-tarball, registry-integrity, SBOM, and provenance gates.

A bootstrap granular access token is transitional infrastructure, not a routine release dependency. After Trusted Publishing is proven, revoke/remove the token if no other legitimate use requires it.

Reference: https://docs.npmjs.com/trusted-publishers/

## Provenance

Public packages published from the public GitHub repository through Trusted Publishing receive npm provenance. The release workflow invokes `npm publish --provenance` explicitly for clarity and defense in depth.

The one-time token-authenticated bootstrap also runs from GitHub Actions with `id-token: write` and explicitly requests provenance. Authentication and provenance are verified separately from artifact identity: the workflow still compares registry `dist.integrity` to the exact local tarball.

## Routine release sequence after bootstrap

1. Prepare the release version and changelog/release notes in a reviewed PR.
2. Run required CI/security checks and browser tests.
3. Merge to `main` only when required checks pass.
4. Confirm the release commit is the intended `main` head.
5. Create the matching Git tag and GitHub Release.
6. GitHub invokes `release.yml` from the reviewed repository state.
7. The workflow installs from the committed lockfile with `npm ci`.
8. It runs the complete package quality gate and inspects package contents.
9. It builds one exact tarball, generates an SPDX SBOM, and retains release evidence.
10. npm publishes through OIDC/Trusted Publishing with provenance.
11. The workflow verifies npm registry integrity against the exact local tarball.
12. Verify exported entry points and installation from a clean consumer project.

## Bootstrap cleanup requirement

The first publication is not complete merely because npm accepted the package. Completion requires all of the following:

- registry artifact identity verified;
- matching GitHub Release/tag bound to the release commit;
- permanent release workflow completes its idempotent validation path;
- temporary bootstrap workflow removed;
- documentation updated to record that bootstrap is complete;
- npm Trusted Publisher mapping created for `release.yml`;
- bootstrap credential revoked once routine OIDC publication has been proven or when it is otherwise no longer required.

## Versioning

The project follows SemVer. Until 1.0, breaking changes require explicit release notes even when they occur in a minor release.

## Rollback

Do not silently replace an already published version. npm versions are immutable. If a release is defective, deprecate it where appropriate and publish a corrected new version. Security incidents follow `SECURITY.md` and may require coordinated disclosure.

## Supply-chain evidence

Every automated release candidate is built from reviewed public source. Release evidence includes deterministic installation, the complete repository quality gate, package-content inspection, an exact tarball, SHA-512 identity verification, SPDX SBOM, and retained GitHub Actions artifacts. Routine releases add OIDC Trusted Publishing and the repository's release attestations.
