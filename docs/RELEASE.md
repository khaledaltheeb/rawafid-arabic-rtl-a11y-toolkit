# Release and publication policy

## Goals

Releases must be reproducible enough to audit, originate from reviewed public source, avoid long-lived npm publication credentials, and carry provenance.

## Preconditions

Before the first publication:

1. Create the independent public GitHub repository.
2. Generate `package-lock.json` with a supported npm/Node environment and commit it after review.
3. Require CI, CodeQL, Dependency Review, and scope checks on the protected `main` branch.
4. Configure npm Trusted Publishing for `.github/workflows/release.yml`.
5. Protect the GitHub `npm` environment if additional human approval is desired.
6. Enable GitHub private vulnerability reporting.
7. Confirm the package name/scope is available and controlled by the maintainer.

The release workflow intentionally fails if `package-lock.json` is absent.

## Authentication

Publication uses npm Trusted Publishing via OIDC. Do not store `NPM_TOKEN` or a classic automation token in this repository. The workflow requests `id-token: write` only for the publish job.

Reference: https://docs.npmjs.com/trusted-publishers/

## Provenance

Public packages published from the public GitHub repository through Trusted Publishing receive npm provenance. The workflow also invokes `npm publish --provenance` explicitly for clarity.

## Release sequence

1. Merge reviewed changes into protected `main`.
2. Update version and `CHANGELOG.md` in a reviewed PR.
3. Ensure all required status checks pass.
4. Create a signed/verified GitHub release for the matching version tag when signing infrastructure is configured.
5. GitHub invokes `release.yml`.
6. The workflow installs from the committed lockfile with `npm ci`.
7. It runs the complete non-browser package quality gate.
8. It inspects `npm pack --dry-run` output.
9. It generates and retains an SPDX SBOM for the release candidate.
10. npm publishes through OIDC with provenance.
11. Verify package metadata/provenance after publication.

## Versioning

The project follows SemVer. Until 1.0, breaking changes require explicit release notes even when they occur in a minor release.

## Rollback

Do not silently replace an already published version. If a release is defective, deprecate it on npm where appropriate and publish a corrected new version. Security incidents follow `SECURITY.md` and may require coordinated disclosure.

## Supply-chain evidence

Every npm release generates an SPDX SBOM from the reviewed lockfile and uploads it as a workflow artifact. Trusted Publishing requires Node >=22.14.0 and npm >=11.5.1; the workflow fails closed if those minimums are not met. npm provenance is enabled for the public package/repository path.
