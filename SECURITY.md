# Security policy

Security-sensitive surfaces in this project include Unicode bidirectional controls, locale negotiation, translation catalogs, dependency changes, CI workflows, publication identity, and the boundary between the public toolkit and private/scientific Rawafid material.

## Reporting a vulnerability

**Security contact:** the primary repository maintainer, [`@khaledaltheeb`](https://github.com/khaledaltheeb), via **contact@healthrenewal.org** with the subject `Rawafid Toolkit security report`.

Do not publish exploit details, secrets, proof-of-concept payloads, or other sensitive vulnerability information in a public GitHub issue before maintainers have assessed the report.

Use GitHub private vulnerability reporting when the repository exposes that reporting channel. Because that feature is an account-bound repository setting, its enablement state must be verified independently and is not inferred from this file.

If GitHub private vulnerability reporting is unavailable, send an initial private report directly to **contact@healthrenewal.org**. The initial message should contain enough information to triage the problem while avoiding unnecessary secrets or personal data:

- affected version/commit and component;
- vulnerability class and expected security impact;
- minimal reproduction conditions;
- whether the issue is already public;
- a safe way to contact the reporter for follow-up.

If reproducing the issue requires credentials, exploit material, private data, or another high-sensitivity artifact, **do not attach that material to the first email**. State that additional sensitive evidence is available; the maintainer will establish an appropriate restricted exchange channel before requesting it.

For non-sensitive correctness bugs, use the public issue tracker.

## Response expectations

Maintainers aim to acknowledge a privately received security report within **14 calendar days** and normally much sooner. This is an initial-response target, not a promise that remediation or public disclosure will be completed within that period.

If no acknowledgement is received within 14 days, send one follow-up to the same security contact with the original subject/reference. Do not publish a still-sensitive report solely because the acknowledgement target was missed.

## Supported versions

Before 1.0, security fixes are applied to the latest public release line and `main`. Maintainers may issue a new pre-1.0 minor/patch rather than backporting to older pre-release lines.

## Coordinated disclosure expectations

Maintainers should acknowledge a privately received security report as soon as practicable, establish a private remediation channel, assess affected supported versions, prepare a fix and advisory where warranted, and coordinate public disclosure only after users have a reasonable mitigation or update path.

Once a vulnerability is public, release notes/advisories should identify the affected and fixed versions and any CVE or comparable public identifier that exists at release time.

## Bidirectional text

Unicode bidi controls can change visual ordering and can be abused to disguise text.

- Use `containsBidiControls` when explicit controls are unexpected.
- Use `hasUnsafeBidiOverrides` to identify legacy embedding/override controls.
- Use `stripUnsafeBidiOverrides` for untrusted display values when policy requires removal.
- Prefer isolates (`bdi`, LRI/RLI/FSI/PDI) over override controls.

These helpers are not a source-code Trojan Source scanner and do not remove Unicode confusables.

## HTML injection

The toolkit deliberately avoids HTML-generating highlight/localization APIs. `segmentHighlights` returns structured text segments, and `announce` writes via `textContent`. Consumers must still use their framework/platform's normal escaping rules.

## Locale data

Locale tags are canonicalized with the platform `Intl` implementation. Do not concatenate untrusted locale input into filesystem paths, module specifiers, SQL, or URLs without an independent allowlist/encoding policy.

## Supply chain and remediation

- External GitHub Actions are pinned to immutable full commit SHAs.
- Direct development dependencies use exact versions.
- Dependency Review and CodeQL workflows are included.
- `npm audit --audit-level=moderate` is part of the mandatory quality gate.
- npm publishing is designed for OIDC Trusted Publishing with provenance.
- The release workflow refuses to publish without a committed lockfile.

The project's measurable SCA/SAST thresholds, release-blocking criteria, and suppression requirements are defined in [docs/SECURITY-REMEDIATION-POLICY.md](./docs/SECURITY-REMEDIATION-POLICY.md). Passing automated analysis is evidence about the configured checks, not proof that the codebase is vulnerability-free.

## Public-scope integrity

`OPEN_SOURCE_SCOPE.md` is a security boundary. The repository must not contain Rawafid scientific/editorial content, private datasets, user information, secrets, production configuration, or proprietary content-pipeline logic.

See [docs/THREAT-MODEL.md](./docs/THREAT-MODEL.md) for the full model and [docs/OSPS-BASELINE.md](./docs/OSPS-BASELINE.md) for evidence mapping against the OpenSSF Open Source Project Security Baseline.
