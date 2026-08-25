# Release provenance and registry identity

Rawafid's release workflow is designed to make the package artifact independently verifiable rather than relying only on a successful `npm publish` log.

## Release evidence chain

For each GitHub Release-triggered publication, the workflow:

1. checks that the GitHub release tag exactly matches `package.json`;
2. installs from the committed lockfile and runs the full quality gate;
3. builds one npm tarball and records its SHA-512 integrity value;
4. generates an SPDX JSON SBOM;
5. publishes that exact tarball through npm Trusted Publishing with npm provenance when the version is new;
6. reads `dist.integrity` back from npm and rejects the release if it differs from the locally built tarball;
7. creates a GitHub artifact build-provenance attestation for the verified tarball;
8. creates a second attestation binding the same tarball to the generated SBOM;
9. retains the tarball, `npm-pack.json`, and SPDX SBOM as the `release-evidence` workflow artifact.

If the package version already exists in npm, the workflow does not republish it. It rebuilds the release tarball from the release tag and requires that its SHA-512 integrity value match the existing registry artifact before producing attestations.

## Consumer verification

After a release has completed successfully, a consumer can download the package tarball and verify its GitHub attestation with GitHub CLI:

```sh
gh attestation verify ./rawafid-arabic-rtl-a11y-toolkit-<version>.tgz \
  --repo khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit
```

The npm registry identity can be inspected independently:

```sh
npm view @rawafid/arabic-rtl-a11y-toolkit@<version> dist.integrity
```

Verification should be performed against the exact package version being consumed.

## Security boundary

The workflow configuration is repository evidence of the intended release process. A successful public attestation is release-specific external evidence and must not be claimed until a release workflow has actually completed and the attestation can be retrieved and cryptographically verified.

This project does not claim a SLSA level solely because it generates GitHub attestations. SLSA level claims depend on the complete build architecture and applicable requirements, not the presence of one provenance mechanism.

The release workflow uses a SHA-pinned `actions/attest` action and disables artifact storage-record creation because the repository is user-owned rather than organization-owned; the signed repository attestation remains the intended verification surface.
