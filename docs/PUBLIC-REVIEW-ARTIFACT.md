# Portable Public Review Artifact

The repository includes an executable public review surface under `site/`. The generated `review-site/` directory is the deployment artifact for that surface.

## Build and validate

```sh
npm ci
npm run site:check
```

`site:check` builds the TypeScript package, assembles a static site, and validates the resulting artifact contract. The generated directory is intentionally ignored by Git and is not part of the npm package allowlist.

## Portability contract

The artifact is designed to work from a static host root or a nested base path. The builder converts test-server absolute paths into relative paths and bundles only the files required by the review surface:

- `index.html`
- `site.css`
- `site.js`
- `dist/index.js`
- `styles/a11y.css`
- `styles/logical.css`
- `artifact-manifest.json`

No framework runtime, server-side code, database, secret, analytics credential, or Rawafid scientific/editorial content is required.

## Integrity manifest

`artifact-manifest.json` records:

- artifact identifier;
- package name and package version;
- canonical entrypoint;
- portable-base-path declaration;
- byte length and SHA-256 digest for every content file.

The manifest intentionally contains no build timestamp or machine-specific path. That avoids needless non-determinism and makes the content contract easier to compare across builders.

The validation script recomputes every byte count and digest and rejects absolute paths that would tie the artifact to the Playwright test server.

## CI evidence

The main CI workflow builds and validates this artifact independently on Node 24 and uploads it as the `public-review-site` GitHub Actions artifact. Browser conformance remains a separate CI job so a successful static build is never presented as evidence that browser/accessibility tests passed.

## Deployment boundary

This repository prepares and verifies a deployable static artifact. It does **not** claim that a public deployment exists until an external host and URL are independently observed. A hosting provider can deploy the contents of `review-site/` without modifying package source.
