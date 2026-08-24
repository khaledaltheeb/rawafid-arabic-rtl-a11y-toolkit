# Release and publication policy

## Goals

Releases must be reproducible enough to audit, originate from reviewed public source, avoid long-lived npm publication credentials, and carry provenance.

## Current readiness state

The independent public GitHub repository and committed `package-lock.json` are already in place. The repository has also completed live CI validation across Node 22, 24, and 26; Playwright browser coverage; CodeQL; package-shape validation; and Dependency Review workflow execution.

The remaining first-publication prerequisites are repository/account settings that cannot be represented safely as source code alone: npm Trusted Publishing, the GitHub `npm` environment, repository security settings such as Dependency Graph/private vulnerability reporting, and protected `main` rules/status checks.

## Preconditions

Before the first npm publication:

1. Confirm `main` is protected by an appropriate GitHub ruleset and requires the intended CI/security checks.
2. Enable GitHub Dependency Graph and the desired Dependabot/security features.
3. Enable GitHub private vulnerability reporting.
4. Configure npm Trusted Publishing for the package and `.github/workflows/release.yml`.
5. Configure/protect the GitHub `npm` environment; require human approval there if desired.
6. Confirm the npm package name/scope is available and controlled by the maintainer.
7. Verify that the release version in `package.json`, `CHANGELOG.md`, Git tag, and GitHub Release all match.
8. Re-run the complete quality and browser matrices on the release candidate.
9. Review `npm pack --dry-run` output and ensure no excluded Rawafid content, secrets, local artifacts, or private material are packaged.

The release workflow fails closed if `package-lock.json` is absent.

## Authentication

Publication uses npm Trusted Publishing via OIDC. Do not store `NPM_TOKEN`, classic automation tokens, or long-lived npm publication secrets in this repository. The workflow requests `id-token: write` only for the publish job.

Reference: https://docs.npmjs.com/trusted-publishers/

## Provenance

Public packages published from the public GitHub repository through Trusted Publishing receive npm provenance. The workflow also invokes `npm publish --provenance` explicitly for clarity.

## Release sequence

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

The first publication should not be used as an experiment with credentials or package naming. If Trusted Publishing, scope ownership, or environment protection is incomplete, do **not** fall back to committing/storing a long-lived npm token merely to publish sooner.

## Versioning

The project follows SemVer. Until 1.0, breaking changes require explicit release notes even when they occur in a minor release.

## Rollback

Do not silently replace an already published version. If a release is defective, deprecate it on npm where appropriate and publish a corrected new version. Security incidents follow `SECURITY.md` and may require coordinated disclosure.

## Supply-chain evidence

Every npm release generates an SPDX SBOM from the reviewed lockfile and uploads it as a workflow artifact. Trusted Publishing requires Node >=22.14.0 and npm >=11.5.1; the workflow fails closed if those minimums are not met. npm provenance is enabled for the public package/repository path.
