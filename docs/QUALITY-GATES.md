# Quality gates

A change is release-eligible only after the applicable gates pass.

## Gate 1: public-scope integrity

`npm run scope:check`

Rejects known private/data directory classes, sensitive file types, actual `.env` files, private keys, and common credential patterns. Human review remains authoritative for semantic/proprietary-content decisions.

## Gate 2: workflow supply chain

`npm run supply-chain:check`

Every external GitHub Action reference must use a full 40-character commit SHA. Dependabot is configured to keep those pins maintainable.

## Gate 3: localization integrity

`npm run catalogs:check`

Requires catalog key parity, string values, non-empty messages, placeholder parity, and absence of legacy bidi embedding/override controls.

## Gate 4: static quality

- ESLint with zero warnings.
- strict TypeScript.
- no unchecked index access.
- exact optional property semantics.

## Gate 5: logic

Vitest unit tests exercise normal, edge, counterexample, and failure behavior.

## Gate 6: package shape

- tsdown builds an ESM distribution and TypeScript declarations.
- publint validates package metadata/exports.
- Are The Types Wrong validates declaration/runtime resolution.

## Gate 7: browser/accessibility

Playwright runs Chromium, Firefox, WebKit, and a mobile profile. axe-core is executed against a controlled RTL fixture.

## Gate 8: repository security

- CodeQL.
- Dependency Review.
- OpenSSF Scorecard.
- SHA-pinned actions.
- minimal workflow permissions.

## Gate 9: publication

The npm workflow is fail-closed unless a committed lockfile exists. Publication verifies the minimum Trusted Publishing runtime, generates an SPDX SBOM, and uses OIDC Trusted Publishing with provenance rather than a long-lived npm token.
