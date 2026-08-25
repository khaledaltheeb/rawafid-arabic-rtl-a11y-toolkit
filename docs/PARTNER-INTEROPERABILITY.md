# Partner interoperability contract

This document defines a vendor-neutral entry point for browser-testing, accessibility, localization, academic, standards, and developer-tooling partners that want to execute or consume the toolkit's highest-value interoperability evidence.

The objective is to reduce integration cost: a partner should not need to understand the entire repository before running a meaningful suite.

## One-command suite

After deterministic dependency installation and Playwright browser installation:

```bash
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run test:partner
```

`npm run test:partner` executes the curated suite declared in `conformance/partner-suite.json`.

## What the suite exercises

The partner contract currently includes controlled evidence for:

- Arabic/RTL accessibility and keyboard interaction;
- mixed-direction content and bidi isolation;
- script-aware direction behavior;
- WCAG 2.2-oriented reflow and target-size regression cases;
- HTML `dir=auto` and `dirname` behavior;
- deterministic RTL/LTR visual-reference behavior;
- CSS logical-edge mirroring;
- localized decimal input and Arabic digit systems;
- locale-aware typeahead, grids, focus, live regions, and axe-core regression checks;
- Chromium, Firefox, WebKit, and a mobile Chromium profile.

The machine-readable suite manifest is authoritative for the selected files, browser-project names, evidence domains, output locations, and explicit non-claims.

## Machine-readable outputs

On CI the Playwright configuration emits:

- `partner-results/playwright-results.json` — comprehensive Playwright JSON results;
- `partner-results/junit.xml` — JUnit-compatible results with browser project names in test case names;
- `playwright-report/` — human-readable HTML report, retained on failure.

GitHub CI uploads a `partner-interoperability-evidence` artifact on every browser run, including successful runs. The artifact combines the JSON/JUnit execution result with:

- `conformance/manifest.json` — standards-evidence claims;
- `conformance/partner-suite.json` — the curated partner suite contract.

This makes results useful to CI platforms, browser-testing providers, research pipelines, quality dashboards, and other systems without requiring log scraping.

## Provider-neutral by design

The core repository does not embed provider credentials or require a specific vendor SDK. A provider integration should wrap or transport the same test contract rather than fork the behavioral expectations.

Examples of legitimate future adapters include:

- real-device/browser execution;
- visual-regression capture over the deterministic RTL/LTR reference surface;
- accessibility-platform ingestion;
- sharded execution and report merging;
- historical result dashboards;
- localization-platform QA hooks.

Provider-specific adapters should be added only after a legitimate account or partnership exists and should preserve the vendor-neutral local/CI path.

## Evidence boundaries

Passing this suite does not establish universal browser correctness, WCAG certification, linguistic correctness for every locale, or assistive-technology conformance in downstream products. It proves only the controlled invariants represented by the versioned fixtures, tests, browser projects, and standards evidence in the repository.

## Why this matters for collaborators

A prospective partner receives a reproducible technical workload rather than a sponsorship narrative. The project can demonstrate exactly what additional infrastructure would improve: broader real-device coverage, deeper browser matrices, visual history, accessibility analysis, localization workflows, or standards research. That makes the collaboration outcome measurable on the public project.
