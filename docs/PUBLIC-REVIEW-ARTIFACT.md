# Public review artifact

The repository can build a self-contained static review surface for the Arabic/RTL toolkit without introducing a runtime framework or a deployment-provider dependency.

## Build

```bash
npm ci
npm run site:build
```

The output is written to `site-dist/` and contains:

- `index.html` — public review entrypoint;
- `review-lab/site.js` and `review-lab/site.css` — review-surface behavior and presentation;
- `dist/` — the same built toolkit exercised by the review surface;
- `styles/` — the package's reusable accessibility and logical-property styles;
- `artifact-manifest.json` — deterministic file inventory with byte sizes and SHA-256 digests.

`site-dist/` is generated output and is intentionally not committed.

## Reproducibility gate

```bash
npm run site:reproducible
```

The gate builds the static artifact twice into independent temporary directories and compares the SHA-256 fingerprint of every resulting file, including the manifest. A mismatch fails the command.

The manifest intentionally contains no build timestamp, runner identity, branch name, or transient commit metadata. Those values would make byte-for-byte reproduction depend on the execution environment rather than the reviewed sources.

## CI artifact

After the real-browser suite succeeds, CI builds the same static output and uploads it as the `rawafid-public-review-lab` workflow artifact. The artifact is separate from `partner-interoperability-evidence`: one is a deployable review surface, while the other is the machine-readable verification bundle.

## Verification model

A reviewer can:

1. inspect the source and package build configuration;
2. run `npm run check` to execute the repository quality gates;
3. run `npm run site:build` to reconstruct the static surface;
4. recompute SHA-256 digests and compare them with `artifact-manifest.json`;
5. serve `site-dist/` from any ordinary static HTTP server.

## Claim boundaries

This artifact demonstrates that the repository can produce a deterministic static review surface from the checked-in sources. It does **not** by itself prove:

- that a public hosting provider has deployed the surface;
- that an npm package has been published;
- that any external organization endorses the project;
- blanket WCAG, Unicode, browser, or security conformance;
- equivalence between a future hosted copy and a particular CI artifact unless their bytes or manifest digests are independently compared.

Provider deployment, npm publication, provenance, and external endorsement remain separate evidence-bearing events.
