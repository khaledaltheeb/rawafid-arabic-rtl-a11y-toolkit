# Public Review Lab artifact

The Public Review Lab is an executable review surface for the toolkit. The source lives in `site/`, while CI also produces a standalone static artifact in `review-site/`.

## Build and verify

```sh
npm run review-site:check
```

The command builds the package, rewrites only the repository-local asset routes needed for static hosting, copies the exact built toolkit JavaScript and CSS assets, and validates the resulting artifact.

The deployable inventory is intentionally small:

- `index.html`
- `site.css`
- `site.js`
- `styles/a11y.css`
- `styles/logical.css`
- `toolkit/index.js`
- `manifest.json`

`manifest.json` records the package identity and SHA-256 plus byte size for each deployable file other than the manifest itself. It contains no build timestamp, host path, runner identifier, or other intentionally variable field, so identical inputs can produce identical integrity metadata.

## CI artifact

The browser job builds and validates the standalone surface before browser testing. After the browser matrix and partner evidence summary both pass, GitHub Actions uploads the directory as the `public-review-lab-static` artifact.

This distinction matters: the repository source demonstrates how the review surface is authored; the CI artifact is a concrete deployment input whose file integrity is machine-checkable.

## Hosting contract

The artifact uses only relative local asset references. It can therefore be hosted at a domain root or below a path prefix by a conventional static-file host without preserving the repository test server's `/dist`, `/styles`, or `/review-lab` routes.

No runtime API, database, analytics service, authentication system, or Rawafid scientific/editorial content is required by the surface.

## Claim boundaries

A successful artifact build proves that the configured static files were assembled and that their recorded hashes match their contents. It does **not** by itself prove:

- that a public deployment exists;
- that a third-party host or browser vendor endorses the project;
- blanket WCAG conformance;
- complete UAX #9, UAX #29, or UTS #39 conformance;
- npm publication or registry provenance.

Those claims require their own independent evidence.
