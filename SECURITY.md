# Security policy

Security-sensitive surfaces in this project include Unicode bidirectional controls, locale negotiation, translation catalogs, dependency changes, CI workflows, publication identity, and the boundary between the public toolkit and private/scientific Rawafid material.

## Reporting a vulnerability

Do not publish exploit details in a public issue before maintainers have assessed the report. Use GitHub private vulnerability reporting once it is enabled on the public repository.

For non-sensitive correctness bugs, use the public issue tracker.

## Supported versions

Before 1.0, security fixes are applied to the latest public release line and `main`. Maintainers may issue a new pre-1.0 minor/patch rather than backporting to older pre-release lines.

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

## Supply chain

- External GitHub Actions are pinned to immutable full commit SHAs.
- Direct development dependencies use exact versions.
- Dependency Review and CodeQL workflows are included.
- npm publishing is designed for OIDC Trusted Publishing with provenance.
- The release workflow refuses to publish without a committed lockfile.

## Public-scope integrity

`OPEN_SOURCE_SCOPE.md` is a security boundary. The repository must not contain Rawafid scientific/editorial content, private datasets, user information, secrets, production configuration, or proprietary content-pipeline logic.

See [docs/THREAT-MODEL.md](./docs/THREAT-MODEL.md) for the full model.
