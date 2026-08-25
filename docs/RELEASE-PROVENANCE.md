# Release provenance and registry identity

Rawafid's release workflow is designed to make package and review artifacts independently verifiable rather than relying only on a successful `npm publish` log.

## Release evidence chain

For each GitHub Release-triggered publication, the workflow:

1. checks that the GitHub release tag exactly matches `package.json`;
2. installs from the committed lockfile and runs the full quality gate;
3. builds one npm tarball and records its SHA-512 integrity value;
4. generates an SPDX JSON SBOM;
5. rebuilds the deterministic, subpath-safe Public Review Lab from the same release tag, including its SHA-256 `artifact-manifest.json` contract;
6. publishes the exact npm tarball through npm Trusted Publishing with npm provenance when the version is new;
7. reads `dist.integrity` back from npm and rejects the release if it differs from the locally built tarball;
8. creates a GitHub artifact build-provenance attestation for the verified npm tarball;
9. creates a second attestation binding the same npm tarball to the generated SBOM;
10. creates build-provenance attestations for the files of the release-specific Public Review Lab;
11. retains the npm tarball, `npm-pack.json`, SPDX SBOM, and complete `review-site/` tree as the `release-evidence` workflow artifact.

If the package version already exists in npm, the workflow does not republish it. It rebuilds the release tarball from the release tag and requires that its SHA-512 integrity value match the existing registry artifact before producing attestations. The review surface is also rebuilt from that same tag, so its manifest and file digests remain release-specific evidence rather than a moving deployment claim.

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

For the Public Review Lab, verify the downloaded release evidence against `review-site/artifact-manifest.json`, then verify an attested review file against this repository. For example:

```sh
gh attestation verify ./review-site/review-lab/index.html \
  --repo khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit
```

The review-site manifest is deterministic and contains the SHA-256 and byte length of every payload file. Verification should always be performed against the exact package/release version being consumed.

## Security boundary

The workflow configuration is repository evidence of the intended release process. A successful public attestation is release-specific external evidence and must not be claimed until a release workflow has actually completed and the attestation can be retrieved and cryptographically verified.

The review-site provenance attestation proves which release workflow built the attested files; it does not prove that any publicly hosted copy is byte-identical. A hosted deployment must be compared independently with the release manifest if deployment identity matters.

This project does not claim a SLSA level solely because it generates GitHub attestations. SLSA level claims depend on the complete build architecture and applicable requirements, not the presence of one provenance mechanism.

The release workflow uses a SHA-pinned `actions/attest` action and disables artifact storage-record creation because the repository is user-owned rather than organization-owned; the signed repository attestation remains the intended verification surface.
