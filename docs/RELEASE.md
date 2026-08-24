# Release and publication policy

## Goals

Releases must be reproducible enough to audit, originate from reviewed public source, avoid long-lived publication credentials, and carry provenance whenever the registry supports it.

## Current readiness state

The independent public GitHub repository and committed `package-lock.json` are already in place. The repository has completed live CI validation across Node 22, 24, and 26; Playwright browser coverage; CodeQL; package-shape validation; and Dependency Review workflow execution.

The remaining first-publication prerequisites are repository/account settings that cannot be represented safely as source code alone: GitHub security/ruleset settings, ownership of the intended npm namespace, npm account 2FA, and—after the package exists—npm Trusted Publishing.

## Important bootstrap constraint

npm Trusted Publishing is configured **per existing package**. npm's current trust-management requirements state that the package must already exist in the registry before a trusted-publisher relationship can be configured. Therefore a brand-new package cannot rely on its future OIDC relationship for the very first registry creation.

The first publication is a controlled bootstrap event:

1. Confirm the intended npm scope/name is owned and writable by the maintainer.
2. Enable account-level 2FA.
3. Publish the first public version interactively from a trusted maintainer machine using the normal npm authentication/2FA path; do not place publication credentials in this repository or GitHub Actions.
4. Immediately configure the package's Trusted Publisher for this repository and `release.yml` (and the `npm` GitHub environment if used).
5. Verify one subsequent release through OIDC before restricting traditional token publishing.
6. After OIDC is verified, select npm's strongest appropriate publishing-access controls and revoke/remove any publication credential that is no longer required.

See `docs/FIRST-PUBLICATION.md` for the operational checklist.

## Preconditions

Before the first npm publication:

1. Confirm `main` is protected by an appropriate GitHub ruleset and requires the intended CI/security checks.
2. Enable GitHub Dependency Graph and the desired Dependabot/security features.
3. Enable GitHub private vulnerability reporting.
4. Confirm npm account-level 2FA is enabled.
5. Confirm the npm package name/scope is available **and controlled by the maintainer**. An organization-scoped package such as `@rawafid/...` requires membership/write access to the corresponding npm organization scope.
6. Verify that the release version in `package.json`, `CHANGELOG.md`, Git tag, and GitHub Release all match.
7. Re-run the complete quality and browser matrices on the release candidate.
8. Review `npm pack --dry-run` output and ensure no excluded Rawafid content, secrets, local artifacts, or private material are packaged.
9. Perform the one-time interactive bootstrap publish described above.
10. Configure npm Trusted Publishing immediately after the package exists.

The automated release workflow fails closed if `package-lock.json` is absent.

## Authentication after bootstrap

Routine publication uses npm Trusted Publishing via OIDC. Do not store `NPM_TOKEN`, classic automation tokens, or long-lived npm publication secrets in this repository. The workflow requests `id-token: write` only for the publish job.

Trusted Publishing currently requires Node >=22.14.0 and npm >=11.5.1 for publishing. npm's `npm trust` management command has a newer CLI requirement and also requires 2FA and an already-existing package; use the npm website or a sufficiently current npm CLI when configuring trust.

Reference: https://docs.npmjs.com/trusted-publishers/

## Provenance

Public packages published from the public GitHub repository through Trusted Publishing receive npm provenance automatically. The workflow also invokes `npm publish --provenance` explicitly for clarity and defense in depth.

## Routine release sequence

1. Prepare the release version and changelog in a reviewed PR.
2. Run required CI/security checks and browser tests.
3. Merge to protected `main` only when required checks pass.
4. Confirm the release commit is the intended `main` head.
5. Create the matching Git tag and GitHub Release.
6. GitHub invokes `release.yml` from the reviewed repository state.
7. The workflow installs from the committed lockfile with `npm ci`.
8. It runs the package quality gate and inspects package contents.
9. It generates and retains an SPDX SBOM for the release candidate.
10. npm publishes through OIDC with provenance.
11. Verify npm metadata, integrity, provenance, exported entry points, and installation from a clean consumer project.
12. Record any release-specific migration or compatibility notes in `CHANGELOG.md`.

## First release guardrail

The first publication must not be converted into a CI token bootstrap. Do **not** add a bypass-2FA token to GitHub merely to create the package. The one-time registry creation should remain an explicit maintainer action protected by 2FA; automation begins only after the package exists and OIDC trust can be configured.

## Versioning

The project follows SemVer. Until 1.0, breaking changes require explicit release notes even when they occur in a minor release.

## Rollback

Do not silently replace an already published version. If a release is defective, deprecate it on npm where appropriate and publish a corrected new version. Security incidents follow `SECURITY.md` and may require coordinated disclosure.

## Supply-chain evidence

Every automated npm release generates an SPDX SBOM from the reviewed lockfile and uploads it as a workflow artifact. npm provenance is enabled for the public package/repository OIDC path.
