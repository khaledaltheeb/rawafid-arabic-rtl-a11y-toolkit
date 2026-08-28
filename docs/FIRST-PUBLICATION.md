# First npm publication checklist

This document covers the one-time creation of `@rawafid/arabic-rtl-a11y-toolkit` before routine npm Trusted Publishing can become the only publication mechanism.

## Package identity

```text
@rawafid/arabic-rtl-a11y-toolkit
```

The scope is part of the package identity. The initial publishing user must either own the npm user scope `rawafid` or have authority to create public packages in the npm organization `rawafid`. A token cannot create rights that its npm user does not possess.

## Why a token is required once

npm Trusted Publisher relationships are configured on an existing package. The package must already exist on the npm registry before its Trusted Publisher can be created. The first OIDC attempt therefore cannot bootstrap a brand-new scoped package by itself.

The one-time bootstrap uses the GitHub Environment secret `rawafid1` solely to create version `0.3.0`. Routine releases must not depend on this credential.

## Credential constraints

`rawafid1` must be an npm Granular Access Token with the least privilege necessary for the `@rawafid` package/scope and direct publishing. If the npm 2FA policy requires it, the token must be configured with Bypass 2FA for automated package publication.

The secret must remain only in the GitHub Environment named `npm`. Never commit it, copy it into documentation, echo it, expose it to pull-request jobs, or reuse it as an application credential.

## Security isolation

The bootstrap is split deliberately:

### 1. Prepare release evidence without credentials

Before any npm credential is available, the workflow must:

1. verify canonical repository, package identity, exact version `0.3.0`, and release tag identity;
2. require synchronized `package.json` and `package-lock.json` versions;
3. run deterministic `npm ci`;
4. run the complete `npm run check` quality/security/package gate;
5. run `npm pack --dry-run`;
6. build exactly one release tarball;
7. compute its local SHA-512 integrity;
8. generate an SPDX SBOM;
9. build the reproducible public review surface;
10. query whether the exact npm version already exists;
11. retain the tarball, pack manifest, SBOM, review surface, and release notes as workflow evidence.

### 2. Create the package with token auth only

The `bootstrap-initial-package` job must have no `id-token: write` and no `attestations: write`. This is intentional: npm CLI automatically prefers OIDC when a supported OIDC identity is available, but a brand-new package does not yet have a package-level Trusted Publisher.

The job:

1. receives `rawafid1` only from the protected `npm` Environment;
2. requires `npm whoami` to authenticate successfully;
3. confirms direct ownership when the npm username itself is `rawafid`, otherwise performs a best-effort membership check for the `rawafid` organization when the token can read that metadata;
4. publishes only the exact prebuilt `0.3.0` tarball with `--access public --provenance=false`;
5. retries the public registry lookup and requires `dist.integrity` to equal the exact local SHA-512 value.

If token authentication, scope authorization, 2FA policy, or registry integrity fails, the workflow stops. It must not change package name/scope merely to bypass registry authorization.

### 3. Attest only after registry identity is proven

A separate job, which does not receive `rawafid1`, runs only after successful registry verification. It receives GitHub OIDC/attestation permissions and creates GitHub attestations for:

- the exact npm tarball;
- the SPDX SBOM bound to that tarball;
- the reproducible public review surface.

Only after those attestations does it create or verify GitHub Release `v0.3.0` on the exact bootstrap commit and attach the tarball, SBOM, and release notes.

## Provenance boundary

Version `0.3.0` must not be advertised as having npm Trusted Publishing provenance if it was created through the bootstrap token path. npm provenance is explicitly disabled for that one-time publish so OIDC cannot intercept the authentication path.

The separate GitHub attestations remain verifiable supply-chain evidence, but they are not the same claim as npm registry Trusted Publishing provenance.

The first routine OIDC release after Trusted Publisher setup is the release that should prove npm Trusted Publishing provenance end-to-end.

## Configure the package Trusted Publisher after creation

Immediately after `0.3.0` is visible and registry integrity is verified, configure the package on npmjs.com:

- Provider: GitHub Actions
- GitHub owner/user: `khaledaltheeb`
- Repository: `rawafid-arabic-rtl-a11y-toolkit`
- Workflow filename: `release.yml`
- Environment: `npm` if an environment restriction is used
- Allowed action: `npm publish` (or deliberately adopt staged publishing later)

The workflow filename must be exactly the configured filename, not a full `.github/workflows/...` path.

## Bootstrap cleanup

After package creation and Trusted Publisher configuration:

1. remove the temporary `push` trigger from `release.yml`;
2. remove all `rawafid1` references from repository workflows;
3. restore routine publication to `release: published` only;
4. retain OIDC `id-token: write` only in routine publish/attestation jobs that need it;
5. revoke/remove `rawafid1` when it has no legitimate remaining use;
6. keep account-level 2FA enabled;
7. prove the next release publishes without any npm publication token;
8. verify npm provenance, registry integrity, GitHub attestations, and clean-consumer installation.

## Abort conditions

Do not publish when any of these is unresolved:

- `rawafid` scope ownership/authorization is uncertain;
- the token does not authenticate with `npm whoami`;
- the token lacks write permission for the intended package/scope;
- automated direct publishing conflicts with the npm 2FA policy;
- package identity/version differs from the locked `@rawafid/arabic-rtl-a11y-toolkit@0.3.0` target;
- CI, security, package-contract, or browser evidence is red;
- the tarball contains credentials, `.env` material, private data, or excluded Rawafid content;
- registry `dist.integrity` does not match the exact locally built tarball.

## Known repository hardening gap

GitHub `main` branch protection/ruleset enforcement is still owner-controlled and not enabled. The reviewed-PR and green-check process is a compensating control for this bootstrap, not evidence that branch-protection requirements are satisfied.
