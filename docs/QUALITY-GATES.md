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

Vitest unit tests exercise normal, edge, counterexample, and failure behavior. Locale-data assertions test package-owned invariants instead of freezing incidental ICU/CLDR wording or lists.

The current interaction layer includes unit evidence for RTL/LTR keyboard movement, roving focus, locale-aware typeahead, disabled-state handling, active-vs-selected independence, single/multiple/range selection, rectangular grid coordinates, RTL physical arrows, row wrapping policy, paging, and grid boundary errors.

## Gate 6: package shape

- tsdown builds an ESM distribution and TypeScript declarations.
- publint validates package metadata/exports.
- Are The Types Wrong validates declaration/runtime resolution.
- the committed lockfile is the deterministic CI dependency input.

## Gate 7: built package behavior

`npm run package:contract`

The gate imports the actual built `dist/index.js` in a non-DOM Node process and verifies:

- JavaScript/declaration root export mapping;
- required CSS/package subpaths;
- representative public exports;
- import safety without browser globals;
- script-direction behavior;
- locale-aware typeahead;
- active-vs-selected selection state;
- physical RTL rectangular-grid movement and row Home behavior.

This is deliberately separate from source unit tests: source can be correct while generated declarations, bundling, or export maps are wrong.

## Gate 8: browser/accessibility

Playwright runs Chromium, Firefox, WebKit, and a mobile Chromium profile against the **built package**.

The controlled Arabic RTL fixture exercises:

- document language/direction and script-aware direction resolution;
- mixed-direction text and `<bdi>` isolation;
- Arabic forms plus intrinsically LTR identifiers/email;
- breadcrumb and tabular content;
- CSS logical inline-start mapping;
- live regions;
- RTL roving composite focus with disabled-item skipping;
- locale-aware typeahead from the built package;
- modified-shortcut and IME/composition boundaries;
- a semantic 2×3 RTL grid with one page-tab stop;
- physical RTL horizontal movement, vertical movement, Home and End;
- pseudo-localization, grapheme-safe truncation, and Unicode-risk output;
- horizontal-overflow regression checks.

axe-core is executed against the complete controlled fixture. A zero-violation automated result is a regression gate only and is not a WCAG certification.

## Gate 9: repository security

- CodeQL.
- Dependency Review.
- OpenSSF Scorecard workflow.
- SHA-pinned actions.
- minimal workflow permissions.
- documented threat/scope boundaries.

## Gate 10: publication

Publication requires the repository release workflow's fail-closed conditions, including exact tag/package-version identity, supported publishing runtime/toolchain, deterministic install, full package checks, dry-run packaging, and SPDX SBOM generation.

For a brand-new npm package, the repository does not pretend OIDC can bootstrap package creation. The one-time first publication requires separately verified npm scope access/account security; subsequent releases may use the configured Trusted Publisher/OIDC path after it has actually been established.

## Gate 11: evidence integrity

Before a release note, README statement, provider application, or public claim describes a gate or capability as verified:

1. identify the exact commit/release the evidence covers;
2. distinguish repository automation from external-account settings;
3. distinguish automated accessibility evidence from manual conformance evaluation;
4. distinguish Unicode risk diagnostics from complete Unicode security conformance;
5. distinguish an implemented provider integration path from actual provider acceptance;
6. record skipped/not-applicable checks honestly;
7. ensure documentation is not describing a stale bootstrap state.

See `docs/VERIFICATION-STATUS.md` and `docs/CAPABILITY-MATURITY.md`.
