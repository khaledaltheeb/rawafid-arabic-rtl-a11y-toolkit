# Public API governance

The toolkit treats its root package exports, generated TypeScript declarations, and published npm artifact as reviewed compatibility surfaces rather than incidental build outputs.

## Runtime export snapshot

`api/public-api.json` is the canonical runtime export snapshot for the package root. `npm run public-api:check` builds the package, imports the real `dist/index.js` in Node, sorts its runtime exports, and compares them exactly with the committed snapshot.

The check fails on both:

- removal or rename of a previously reviewed export;
- addition of a new export that has not been deliberately added to the snapshot.

This makes API growth and breakage visible in code review. Updating the snapshot is not a bypass: the same change must be reviewed for compatibility and versioning impact.

## TypeScript declaration fingerprint

`api/public-types.sha256` records the SHA-256 fingerprint of normalized `dist/index.d.ts`. `npm run public-types:check` rebuilds the package, normalizes line endings and the generated source-map footer, hashes the declaration file, and compares it with the reviewed baseline.

This catches declaration drift even when runtime export names remain unchanged, including many signature, parameter, return-type, overload, option-shape, and exported-type changes.

The fingerprint is deliberately a tripwire, not a semantic compatibility oracle. A changed hash requires a human review of the generated declaration diff before the baseline is updated.

## npm artifact boundary

`npm run package:artifact` executes `npm pack --dry-run --json --ignore-scripts` against the already-built tree and enforces:

- an exact allowlist of ten intended published files;
- no unexpected source, test, configuration, or private files;
- a 100,000-byte packed-size budget;
- a 300,000-byte unpacked-size budget.

At the baseline established for this gate, npm reports 52,502 packed bytes and 187,872 unpacked bytes. These numbers are evidence for that reviewed build, not permanent package-size promises.

## Versioning policy

The project follows Semantic Versioning for public releases:

- patch: backward-compatible fixes with no public contract break;
- minor: backward-compatible public API additions;
- major: intentional incompatible public API changes.

Pre-1.0 releases still document compatibility impact explicitly even though SemVer permits greater latitude before 1.0.

## Layered evidence

No single gate establishes compatibility by itself. The project combines:

1. exact runtime export-name governance;
2. generated TypeScript declaration fingerprinting;
3. behavioral built-package contracts;
4. publint and Are The Types Wrong resolution checks;
5. exact npm artifact inventory and size budgets;
6. real-browser interoperability tests;
7. security and dependency-review gates.

## Removal and incompatible-change policy

Public APIs should normally be deprecated before removal. An incompatible change requires:

1. an explicit compatibility note;
2. migration guidance where practical;
3. an appropriate release-version decision;
4. intentional updates to the affected API baselines;
5. review of the generated declaration change;
6. passing package, type, browser, and security gates.

## Repository settings

The in-repository gates cannot prevent an administrator from bypassing GitHub review controls. The repository should additionally protect `main` with a ruleset requiring pull requests and the project quality/security checks. This is an external repository setting and is tracked separately from source-level evidence.
