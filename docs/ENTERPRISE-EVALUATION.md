# Enterprise evaluation kit

This document turns the Rawafid Arabic/RTL Accessibility & Localization Toolkit into a low-friction technical evaluation rather than a partnership promise.

The machine-readable source of truth is [`enterprise/evaluation-plan.json`](../enterprise/evaluation-plan.json), validated against [`schemas/enterprise-evaluation.schema.json`](../schemas/enterprise-evaluation.schema.json).

## What an adopter should be able to decide

A pilot should answer four questions with evidence:

1. **Does Rawafid catch or prevent material Arabic/RTL engineering defects that the current toolchain does not already block?**
2. **Is the finding quality high enough for the intended workflow?** Advisory findings may be valuable even when they should not block CI.
3. **Can the organization adopt it incrementally without sending source to Rawafid or replacing its existing accessibility/localization/security tools?**
4. **Can the result be reproduced by another engineer from public code, policy, fixtures, and machine-readable output?**

A positive answer does not require every profile below. Select the profile that matches the team's actual problem.

## Evaluation principles

- Test on a real repository or a representative public fixture.
- Start in reporting-only mode. Enforcement is a later, explicit policy decision.
- Count both useful findings and false positives; do not measure success by raw finding volume.
- Keep the adopter's source in the adopter environment. The source audit requires no network service and does not execute the audited project code.
- Compare Rawafid with the adopter's existing tooling; the value proposition is incremental coverage, not tool replacement.
- Keep WCAG, ISO, EN 301 549, EAA, Unicode, linguistic-quality, and security claims narrower than the actual evidence.

## Profile A — Source audit in CI

**Best fit:** platform engineering, DevSecOps, accessibility engineering, frontend infrastructure.

Start with:

```bash
rawafid-rtl-audit . --strict --format json --fail-on none
rawafid-rtl-audit . --strict --format sarif --out rawafid-rtl.sarif --fail-on none
```

Or use the first-party GitHub Action documented in [`GITHUB-ACTION.md`](GITHUB-ACTION.md).

Review each finding as one of:

- actionable defect;
- useful risk/review signal;
- intentionally physical/context-specific behavior;
- false positive;
- duplicate of an already enforced internal rule.

The most important metric is **unique actionable value**, not the total number of findings. A mature repository may correctly produce zero active findings; that is still useful when the evaluated scope is representative and the result is reproducible.

For brownfield repositories, create a reviewed counted baseline, then deliberately add another matching defect. The additional occurrence should remain active after the historical allowance is consumed. This proves the baseline is migration state rather than a permanent wildcard exemption.

## Profile B — Design-system RTL interoperability

**Best fit:** design systems, component libraries, browser-testing providers, frontend platform teams.

Evaluate representative navigation, forms, dialogs, menus, tabs, grids/tables, pagination, and mixed-direction components in both LTR and RTL.

Rawafid's public partner/browser suite provides examples for:

- direction-aware arrow movement;
- Home/End and grid navigation;
- roving tabindex and focus restoration;
- `dir=auto`, `bdi`, mixed Arabic/Latin identifiers, and localized inputs;
- CSS logical-edge behavior;
- 320 CSS-pixel reflow;
- forced colors and reduced motion;
- controlled axe-core regression checks;
- paired deterministic RTL/LTR visual surfaces.

A successful pilot should produce an explicit list of invariants that the adopter can keep in its own browser/visual CI. Rawafid should reduce repeated RTL-specific reasoning, not become a hidden black box.

## Profile C — Localization and locale-boundary QA

**Best fit:** localization platforms, translation engineering, internationalization teams, global products.

Use representative catalogs and the actual target locale/script requirements. Separate three questions:

1. structural integrity — keys, placeholders, markup tokens, bidi/isolate structure;
2. runtime locale behavior — fallback, numbering systems, segmentation, plural/display-name/formatting APIs;
3. linguistic quality — wording, terminology, tone, cultural appropriateness.

Rawafid can automate parts of the first two. It does not claim to automate the third.

A high-value pilot demonstrates that explicit BCP 47 script constraints are not silently discarded, and that localized numeric inputs can round-trip under the declared runtime contract without destructive punctuation normalization or a hard-coded Western grouping assumption.

## Profile D — Unicode bidi and display-risk review

**Best fit:** AppSec, messaging, identity/identifier systems, developer tools, trust & safety.

Use representative untrusted labels or identifiers and document context. Mixed-script text is not automatically malicious; neither are all zero-width characters. The pilot should determine where these signals are useful in the adopter's actual product.

Rawafid currently provides defense-in-depth diagnostics for:

- bidi controls and unsafe overrides;
- isolate balance;
- zero-width characters;
- represented letter scripts;
- source-level escaped bidi controls.

It deliberately does **not** claim complete UTS #39 confusable detection, identifier restriction profiles, or full Trojan Source analysis. If those are required, the pilot should identify the dedicated Unicode security layer needed in addition to Rawafid.

## Evidence package for an internal decision

At the end of a pilot, keep a small review packet:

| Evidence | Purpose |
| --- | --- |
| Rawafid commit/ref | Makes the evaluated implementation immutable/reproducible. |
| Evaluation profile | States what problem was actually tested. |
| Scan/test scope | Prevents extrapolating from a tiny fixture to the entire product. |
| Raw JSON/SARIF/browser result | Preserves machine evidence. |
| Finding disposition table | Records useful findings and false positives. |
| Policy/baseline diff | Shows what would be enforced and what legacy debt is temporarily accepted. |
| Existing-tool comparison | Demonstrates incremental rather than duplicated value. |
| Decision note | Adopt, adopt reporting-only, request changes, or do not adopt — with reasons. |

This packet is intentionally vendor-neutral. A company can conclude that Rawafid is not a fit and still retain a reproducible technical result.

## Suggested acceptance language

A technically meaningful positive result is:

> On the evaluated scope, Rawafid produced reproducible Arabic/RTL engineering evidence that added useful coverage beyond the existing pipeline with an acceptable review burden. The team identified an explicit policy for which Rawafid rules remain advisory and which may block new changes. No broader accessibility, legal, linguistic, or security certification is inferred from this result.

A technically meaningful negative result is equally acceptable:

> On the evaluated scope, Rawafid did not add sufficient unique coverage or produced excessive review noise relative to the existing pipeline. The result is recorded without implying that the toolkit is unsuitable for unrelated products or profiles.

## Why this lowers adoption risk

The adopter does not need to grant Rawafid repository access, purchase a service, replace a design system, migrate localization infrastructure, or accept an institutional relationship to evaluate the toolkit. The source is public, the core is Apache-2.0, the source audit is offline-capable, the policy is machine-readable, and the evidence can remain entirely inside the adopter's own CI.

That is the intended offer: **a reversible technical evaluation with measurable value and explicit boundaries**.
