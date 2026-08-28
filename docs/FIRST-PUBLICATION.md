# First npm publication — completed record

The first public npm publication of `@rawafid/arabic-rtl-a11y-toolkit` is complete. This document is retained as an audit record of the one-time bootstrap; it is no longer an operational instruction for routine releases.

## Outcome

- Package: `@rawafid/arabic-rtl-a11y-toolkit`
- First npm version: `0.3.0`
- First publication date: 2026-08-28
- Registry access: public
- GitHub Release: `v0.3.0`
- Release assets: exact tarball, SPDX SBOM, release notes
- Post-publication evidence: registry SHA-512 identity verification plus GitHub attestations for the tarball, SBOM, and public review surface

The one-time publication used an npm Granular Access Token stored as the GitHub `npm` Environment secret `rawafid1`. The workflow verified the authenticated npm identity and `rawafid` organization authorization before publication.

## Why a bootstrap was needed

The package did not yet exist on npm. The initial package creation therefore used traditional token authentication once, isolated from the permanent Trusted Publishing path.

The bootstrap job deliberately had no `id-token: write` and no `attestations: write`, ensuring npm could not silently switch the first-package creation attempt to OIDC. It published only the exact prebuilt `0.3.0` tarball and explicitly disabled npm provenance for that token-authenticated publish.

## Controls that were exercised

Before any publication credential was available, the workflow:

1. verified canonical repository, package identity, exact version, and release identity;
2. required synchronized `package.json` and `package-lock.json` versions;
3. ran deterministic `npm ci`;
4. ran the complete `npm run check` quality/security/package gate;
5. inspected package contents with `npm pack --dry-run`;
6. built exactly one release tarball;
7. computed its local SHA-512 integrity;
8. generated an SPDX SBOM;
9. built the reproducible public review surface;
10. retained the tarball, pack manifest, SBOM, review surface, and release notes as workflow evidence.

The token-authenticated bootstrap then:

1. authenticated successfully with npm;
2. confirmed the publishing identity was an authorized member of the npm `rawafid` organization;
3. published only `@rawafid/arabic-rtl-a11y-toolkit@0.3.0`;
4. published with public access and `--provenance=false`;
5. stopped before attestations until registry identity could be independently checked.

A corrected credential-independent registry check subsequently confirmed that npm `dist.integrity` matched the locally computed SHA-512 for the exact tarball. The publication step was skipped on that verification run because `0.3.0` already existed, preventing a duplicate publish attempt.

Only after registry identity was proven did a separate GitHub OIDC job create attestations and GitHub Release `v0.3.0`.

## Provenance boundary

Do **not** advertise npm package version `0.3.0` as having been published through npm Trusted Publishing. Its first registry creation used the one-time token bootstrap with npm provenance disabled.

The GitHub attestations created after registry verification are valid separate supply-chain evidence, but they are not an npm Trusted Publishing provenance statement for the `0.3.0` registry publication.

Routine versions after bootstrap use the permanent OIDC-only release workflow and should be evaluated for npm provenance independently.

## Bootstrap retirement

The repository cleanup after first publication removes:

- the push-triggered bootstrap publication path;
- `bootstrap-initial-package`;
- `attest-bootstrap-package`;
- every `rawafid1` / `NODE_AUTH_TOKEN` reference from the permanent release workflow;
- the duplicate retired bootstrap workflow, which remains forbidden by policy tests.

The permanent workflow is `release: published` only and uses npm Trusted Publishing/OIDC for future new versions.

The temporary npm token should be revoked or removed from GitHub once it has no remaining legitimate use. Do not reuse it as a routine publication or application credential.

## Known repository hardening gap

GitHub `main` branch protection/ruleset enforcement remains owner-controlled and was not enabled at the time of this first publication. Reviewed PRs and green checks were compensating controls for the bootstrap; they are not evidence that branch-protection requirements are satisfied.
