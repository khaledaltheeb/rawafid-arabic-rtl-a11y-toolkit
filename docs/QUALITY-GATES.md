# Quality gates

A change is release-eligible only after the applicable gates pass. A green automated run is necessary evidence, not permission to overstate what the project or a consuming application conforms to.

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

Vitest unit tests exercise normal, edge, counterexample, and failure behavior. Locale-data assertions should test owned invariants rather than freeze incidental ICU/CLDR wording when the package does not own that wording.

## Gate 6: package shape

- tsdown builds an ESM distribution and TypeScript declarations.
- publint validates package metadata/exports.
- Are The Types Wrong validates declaration/runtime resolution.
- the committed lockfile is the deterministic CI dependency input.

## Gate 7: browser/accessibility

Playwright runs Chromium, Firefox, WebKit, and a mobile Chromium profile against the **built package**. The controlled RTL fixture exercises mixed-direction text, forms, emails/identifiers, breadcrumb navigation, tabular content, logical CSS, live regions, RTL composite focus behavior, QA helpers, and horizontal-overflow regression checks.

axe-core is executed against the controlled fixture. A zero-violation automated result is a regression gate only and is not a WCAG certification.

## Gate 8: repository security

- CodeQL.
- Dependency Review.
- OpenSSF Scorecard workflow.
- SHA-pinned actions.
- minimal workflow permissions.
- documented threat/scope boundaries.

## Gate 9: publication

Publication requires the repository release workflow's fail-closed conditions, including exact tag/package-version identity, supported publishing runtime/toolchain, deterministic install, full package checks, dry-run packaging, and SPDX SBOM generation.

For a brand-new npm package, the repository does not pretend OIDC can bootstrap package creation. The one-time first publication requires separately verified npm scope access/account security; subsequent releases may use the configured Trusted Publisher/OIDC path after it has actually been established.

## Gate 10: evidence integrity

Before a release note, README statement, provider application, or public claim describes a gate or capability as verified:

1. identify the exact commit/release the evidence covers;
2. distinguish repository automation from external-account settings;
3. distinguish automated accessibility evidence from manual conformance evaluation;
4. distinguish Unicode risk diagnostics from complete Unicode security conformance;
5. distinguish an implemented provider integration path from actual provider acceptance;
6. record skipped/not-applicable checks honestly;
7. ensure documentation is not describing a stale bootstrap state.

See `docs/VERIFICATION-STATUS.md` and `docs/CAPABILITY-MATURITY.md`.
