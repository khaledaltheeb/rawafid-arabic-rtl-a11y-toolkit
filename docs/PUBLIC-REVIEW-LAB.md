# Public Review Lab artifact

The repository contains an executable public review surface under `site/`. The source surface is tested in real browsers, but source files alone are not the deployment contract.

`npm run site:build` creates `review-site/`, a framework-free static artifact that can be served by a conventional static file host at an origin root or under a subpath. Its entry point is:

```text
review-lab/index.html
```

The artifact contains only the files required by the review surface at runtime plus its machine-readable contract and Apache-2.0 license notices:

- the review-lab HTML, CSS, and browser module;
- the built toolkit JavaScript imported by the browser module;
- the toolkit accessibility and logical-property CSS;
- `schemas/review-site-artifact.schema.json`;
- `LICENSE` and `NOTICE`;
- `artifact-manifest.json`.

## Integrity and schema contract

`artifact-manifest.json` is deterministic. It intentionally contains no wall-clock build timestamp and no Git commit identifier. For each payload file it records:

- relative deployment path;
- byte length;
- SHA-256 digest.

The manifest points to the packaged `schemas/review-site-artifact.schema.json`, which uses JSON Schema Draft 2020-12 and fixes the artifact identity, package identity, entry point, deployment model, safe path shape, build-input modes, byte counts, and lowercase SHA-256 shape.

The source commit remains available from the CI run that produced the artifact. Omitting commit-specific metadata from the payload means byte-identical source inputs can produce byte-identical static artifacts.

`npm run site:check` builds the artifact twice in isolated temporary directories and fails if, among other contract violations:

1. the file sets differ;
2. any corresponding file digest differs;
3. the manifest does not exactly describe the payload;
4. a manifest digest or byte count is inaccurate;
5. the deployment entry point, schema binding, or subpath-safe deployment model changes unexpectedly;
6. the packaged schema dialect, required fields, constants, or package binding disagree with the manifest;
7. unsafe or origin-root local paths appear;
8. required CSS/module references disappear; or
9. the page stops importing the toolkit's built `dist/index.js` runtime.

This check is part of the mandatory `npm run check` quality gate on Node 22, 24, and 26.

## Browser acceptance of the exact artifact

Playwright builds `review-site/` before the E2E server starts and serves the generated payload under an isolated subpath. Chromium, Firefox, WebKit, and mobile Chromium then exercise that packaged artifact directly.

The acceptance suite verifies that the artifact:

- loads its packaged toolkit and CSS rather than development-path substitutes;
- preserves explicit-script direction semantics such as `az-Arab` versus `az-Latn`;
- remains free of automated axe violations in the controlled fixture;
- reflows without page-level horizontal overflow at 320 CSS pixels; and
- serves the declared artifact manifest contract.

## Content Security Policy

The HTML carries a restrictive `Content-Security-Policy` meta policy before other metadata. The review surface is intentionally self-contained, so the policy uses `default-src 'none'`, allows scripts and styles only from `'self'`, and denies network connections, objects, frames, workers, manifests, media, base URLs, and form submissions that the surface does not need. It does not allow `'unsafe-inline'` or `'unsafe-eval'`.

The exact-artifact browser suite verifies the policy in every Playwright project and deliberately attempts to inject an inline script. The test requires the script to remain unexecuted and a `securitypolicyviolation` event to identify `script-src` enforcement.

A CSP delivered through `<meta http-equiv="Content-Security-Policy">` cannot enforce every header-only directive. In particular, `frame-ancestors` is not supported in the meta-delivered policy. A production static host that should prevent third-party framing should additionally send a response header such as:

```text
Content-Security-Policy: frame-ancestors 'none'
```

That host-level control is intentionally documented as a deployment requirement rather than claimed as something the static artifact can enforce by itself.

## CI artifact

After the real-browser suite succeeds, CI runs `npm run site:build` and uploads the resulting directory as the `public-review-lab-static` workflow artifact. The artifact is retained for 30 days by the repository workflow.

This provides a reviewable, deployment-ready output without coupling the project to a specific hosting vendor.

## Claim boundaries

A successful build and browser acceptance prove that the repository can produce the declared static artifact reproducibly and that the generated payload passes the controlled browser/security/accessibility checks in the declared matrix. They do **not** by themselves prove that:

- a public deployment exists;
- a particular URL is serving that exact artifact;
- every hosting provider applies the recommended response headers;
- a third-party provider has endorsed the project; or
- the review surface constitutes blanket WCAG, Unicode, browser, or security certification.

Public-deployment claims should be made only after the deployed origin and artifact can be independently observed.
