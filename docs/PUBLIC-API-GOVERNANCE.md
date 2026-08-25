# Public API governance

The toolkit treats its root package exports as a reviewed compatibility surface rather than an incidental by-product of barrel files.

## Snapshot gate

`api/public-api.json` is the canonical runtime export snapshot for the package root. `npm run public-api:check` builds the package, imports the real `dist/index.js` in Node, sorts its runtime exports, and compares them exactly with the committed snapshot.

The check fails on both:

- removal or rename of a previously reviewed export;
- addition of a new export that has not been deliberately added to the snapshot.

This makes API growth and breakage visible in code review. Updating the snapshot is not a bypass: the same change must be reviewed for compatibility and versioning impact.

## Versioning policy

The project follows Semantic Versioning for public releases:

- patch: backward-compatible fixes with no public contract break;
- minor: backward-compatible public API additions;
- major: intentional incompatible public API changes.

Pre-1.0 releases still document compatibility impact explicitly even though SemVer permits greater latitude before 1.0.

## What the snapshot does and does not prove

The snapshot protects runtime export names. It does not replace:

- TypeScript declaration validation;
- behavioral contract tests;
- documentation review;
- deprecation policy;
- browser interoperability tests;
- semantic-version review.

Those layers remain independent quality gates.

## Removal policy

Public APIs should normally be deprecated before removal. A removal requires:

1. an explicit compatibility note;
2. migration guidance where practical;
3. an appropriate release-version decision;
4. an intentional update to `api/public-api.json`;
5. passing package, type, browser, and security gates.

## Repository settings

The in-repository gate cannot prevent an administrator from bypassing GitHub review controls. The repository should additionally protect `main` with a ruleset requiring pull requests and the project quality/security checks. This is an external repository setting and is tracked separately from source-level evidence.
