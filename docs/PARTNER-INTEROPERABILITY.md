# Partner interoperability contract

This document defines a vendor-neutral entry point for browser-testing, accessibility, localization, academic, standards, security, and developer-tooling partners that want to execute or consume the toolkit's highest-value interoperability evidence.

The objective is to reduce integration cost: a partner should not need to understand the entire repository before running a meaningful suite or evaluating its result.

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
- WCAG 2.2-oriented reflow, target-size, focus-obscuration, and text-spacing regression cases;
- HTML `dir=auto` and `dirname` behavior;
- deterministic RTL/LTR visual-reference behavior;
- CSS logical-edge mirroring;
- localized decimal input and Arabic digit systems;
- locale-aware typeahead, grids, focus, live regions, and axe-core regression checks;
- an independently authored Arabic-aware Unicode display-risk research corpus;
- Chromium, Firefox, WebKit, and a mobile Chromium profile.

The machine-readable suite manifest is authoritative for the selected files, browser-project names, research assets, evidence domains, output locations, and explicit non-claims.

## Machine-readable outputs

On CI the Playwright configuration emits:

- `partner-results/playwright-results.json` — comprehensive Playwright JSON results;
- `partner-results/junit.xml` — JUnit-compatible results with browser project names in test case names;
- `partner-results/evidence-summary.json` — a stable Rawafid partner-evidence summary generated through a custom Playwright reporter;
- `playwright-report/` — human-readable HTML report, retained on failure.

### Stable evidence summary

The summary is designed for fast due diligence and automated ingestion. It records:

- schema and suite identity;
- generation timestamp;
- GitHub repository, commit SHA, run ID, and run attempt when executed on GitHub Actions;
- overall selected-test totals and final statuses;
- per-browser-project totals;
- per-evidence-domain totals;
- the exact selected test files and their evidence domains;
- the number of standards claims represented by `conformance/manifest.json`;
- research assets declared by the partner suite;
- retry/attempt history for selected tests;
- the same explicit non-claim boundaries as the partner manifest.

A separate CI validation step rejects the evidence package when the summary is missing, identifies the wrong suite, contains selected failures/timeouts/interruptions, omits any declared browser project or selected spec, or disagrees with the standards/research-asset manifests. The evidence file is therefore itself a tested contract rather than an informational log.

## Retained evidence artifact

GitHub CI uploads a `partner-interoperability-evidence` artifact on every browser run, including successful runs. The artifact combines the machine-readable execution results with:

- `conformance/manifest.json` — standards-evidence claims;
- `conformance/partner-suite.json` — the curated partner suite contract;
- `tests/fixtures/unicode-display-risk-corpus.json` — the Arabic-aware Unicode research asset.

This makes results useful to CI platforms, browser-testing providers, research pipelines, accessibility/security review, quality dashboards, and other systems without requiring log scraping or repository-specific interpretation.

## Provider-neutral by design

The core repository does not embed provider credentials or require a specific vendor SDK. A provider integration should wrap or transport the same test contract rather than fork the behavioral expectations.

Examples of legitimate future adapters include:

- real-device/browser execution;
- visual-regression capture over the deterministic RTL/LTR reference surface;
- accessibility-platform ingestion;
- sharded execution and report merging;
- historical result dashboards;
- localization-platform QA hooks;
- security/research ingestion of the Unicode risk corpus.

Provider-specific adapters should be added only after a legitimate account or partnership exists and should preserve the vendor-neutral local/CI path.

## Evidence boundaries

Passing this suite does not establish universal browser correctness, WCAG certification, Unicode security conformance, linguistic correctness for every locale, or assistive-technology conformance in downstream products. It proves only the controlled invariants represented by the versioned fixtures, tests, browser projects, standards evidence, and research assets in the repository.

## Why this matters for collaborators

A prospective partner receives a reproducible technical workload and a validated evidence package rather than a sponsorship narrative. The project can demonstrate exactly what additional infrastructure would improve: broader real-device coverage, deeper browser matrices, visual history, accessibility analysis, localization workflows, Unicode/security research, or standards work. The collaboration outcome can be measured against versioned public evidence instead of subjective claims.
