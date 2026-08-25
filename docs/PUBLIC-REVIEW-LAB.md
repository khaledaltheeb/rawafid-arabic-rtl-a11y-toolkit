# Public Review Lab artifact

The repository contains an executable public review surface under `site/`. The source surface is tested in real browsers, but source files alone are not the deployment contract.

`npm run site:build` creates `review-site/`, a framework-free static artifact that can be served by any conventional static file host. Its entry point is:

```text
/review-lab/index.html
```

The artifact contains only the files required by the review surface at runtime plus its integrity contract and Apache-2.0 license notices:

- the review-lab HTML, CSS, and browser module;
- the built toolkit JavaScript imported by the browser module;
- the toolkit accessibility and logical-property CSS;
- `LICENSE` and `NOTICE`;
- `schemas/review-site-artifact.schema.json`;
- `artifact-manifest.json`.

## Integrity contract

`artifact-manifest.json` is deterministic and identifies its packaged JSON Schema Draft 2020-12 contract. It intentionally contains no wall-clock build timestamp and no Git commit identifier. For each payload file it records:

- relative deployment path;
- byte length;
- SHA-256 digest.

The source commit remains available from the CI run that produced the artifact. Omitting commit-specific metadata from the payload means byte-identical source inputs can produce byte-identical static artifacts.

`npm run site:check` builds the artifact twice in isolated temporary directories and fails if:

1. the file sets differ;
2. any corresponding file digest differs;
3. the manifest does not exactly describe the payload;
4. a manifest digest or byte count is inaccurate;
5. the manifest no longer matches the repository's machine-readable artifact contract;
6. the deployment entry point or static-only deployment model changes unexpectedly;
7. required CSS/module references disappear; or
8. the page stops importing the toolkit's built `dist/index.js` runtime.

The exact packaged artifact is also executed under an isolated `/artifact/` subpath in Chromium, Firefox, WebKit, and mobile Chromium. That browser matrix checks packaged runtime loading, explicit-script direction semantics, axe results, 320 CSS-pixel reflow, and the served deployment contract.

These checks are part of the repository quality/evidence gates.

## CI artifact

After the real-browser suite succeeds, CI runs `npm run site:build` and uploads the resulting directory as the `public-review-lab-static` workflow artifact. The artifact is retained for 30 days by the repository workflow.

This provides a reviewable, deployment-ready output without coupling the project to a specific hosting vendor.

## Verify a hosted deployment

A future public deployment can be compared byte-for-byte with a locally retained or release-specific manifest:

```sh
npm run site:verify-deployment -- \
  --base-url https://example.org/path/to/review-site/ \
  --manifest review-site/artifact-manifest.json
```

The verifier:

1. requires HTTPS by default;
2. downloads the hosted `artifact-manifest.json` and requires it to byte-match the expected local manifest;
3. fetches every file declared by that manifest;
4. checks every byte length and SHA-256 digest; and
5. fails closed on a missing, redirected, modified, truncated, or otherwise non-identical payload.

For controlled local tests only, `--allow-http` permits loopback HTTP. The mandatory `site:deployment-verifier-check` gate starts an isolated local server, proves an exact deployment passes, then deliberately tampers with the served `dist/index.js` and proves the verifier rejects it.

Passing this verifier is evidence that the bytes observed at that base URL match the expected artifact at the time of verification. It is not a continuity guarantee about what the host may serve later.

## Claim boundaries

A successful build proves that the repository can produce the declared static artifact reproducibly under the tested environment. It does **not** by itself prove that:

- a public deployment exists;
- a particular URL is serving that exact artifact;
- a third-party provider has endorsed the project; or
- the review surface constitutes blanket WCAG, Unicode, browser, or security certification.

A successful deployment-verifier run narrows the second boundary to the observation time and manifest used by that run; it does not establish permanent hosting identity or provider endorsement.
