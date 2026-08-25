# Public Review Lab artifact

The repository contains an executable public review surface under `site/`. The source surface is tested in real browsers, but source files alone are not the deployment contract.

`npm run site:build` creates `review-site/`, a framework-free static artifact that can be served by any conventional static file host. Its entry point is:

```text
/review-lab/index.html
```

The artifact contains only the files required by the review surface at runtime plus the Apache-2.0 license notices:

- the review-lab HTML, CSS, and browser module;
- the built toolkit JavaScript imported by the browser module;
- the toolkit accessibility and logical-property CSS;
- `LICENSE` and `NOTICE`;
- `artifact-manifest.json`.

## Integrity contract

`artifact-manifest.json` is deterministic. It intentionally contains no wall-clock build timestamp and no Git commit identifier. For each payload file it records:

- relative deployment path;
- byte length;
- SHA-256 digest.

The source commit remains available from the CI run that produced the artifact. Omitting commit-specific metadata from the payload means byte-identical source inputs can produce byte-identical static artifacts.

`npm run site:check` builds the artifact twice in isolated temporary directories and fails if:

1. the file sets differ;
2. any corresponding file digest differs;
3. the manifest does not exactly describe the payload;
4. a manifest digest or byte count is inaccurate;
5. the deployment entry point or static-only deployment model changes unexpectedly;
6. required CSS/module references disappear; or
7. the page stops importing the toolkit's built `dist/index.js` runtime.

This check is part of the mandatory `npm run check` quality gate on Node 22, 24, and 26.

## CI artifact

After the real-browser suite succeeds, CI runs `npm run site:build` and uploads the resulting directory as the `public-review-lab-static` workflow artifact. The artifact is retained for 30 days by the repository workflow.

This provides a reviewable, deployment-ready output without coupling the project to a specific hosting vendor.

## Claim boundaries

A successful build proves that the repository can produce the declared static artifact reproducibly under the tested environment. It does **not** by itself prove that:

- a public deployment exists;
- a particular URL is serving that exact artifact;
- a third-party provider has endorsed the project; or
- the review surface constitutes blanket WCAG, Unicode, browser, or security certification.

Public-deployment claims should be made only after the deployed origin and artifact can be independently observed.
