# Partner offer matrix

Rawafid should not send the same partnership request to every organization. The machine-readable source of truth is [`enterprise/partner-offer-matrix.json`](../enterprise/partner-offer-matrix.json), validated against [`schemas/partner-offer-matrix.schema.json`](../schemas/partner-offer-matrix.schema.json).

The rule is simple: **lead with the counterparty's engineering problem, offer a reversible technical pilot, and ask for the smallest contribution that can produce useful evidence.**

## What every offer should preserve

- Public Apache-2.0 source and inspectable evidence before a commitment.
- A pilot that can succeed or fail honestly; Rawafid does not require a positive conclusion.
- No private-source transfer for source-audit evaluation unless the counterparty explicitly chooses another arrangement.
- Measurement of unique actionable value and false positives beside existing tools.
- Upstreamable tests/fixtures/documentation where possible instead of lock-in.
- No claim that an organization is a partner, sponsor, reviewer, certifier, or endorser before written evidence exists.
- Standards references never imply certification automatically.

## Design systems and component libraries

**Problem:** reusable components can remain LTR-biased even after normal accessibility testing.

**Offer:** evaluate one critical component family in paired LTR/RTL conditions and return minimal reproducible issues, keyboard/browser evidence, and upstream-ready regression cases.

**Ask:** a representative component scope and maintainer review of intended versus defective behavior.

**Why this is low friction:** no framework migration, no long-term contract, and the maintainer can keep only the tests that add value.

## Accessibility platforms and a11y teams

**Problem:** generic WCAG automation is essential but does not encode every Arabic/RTL, bidi, logical-layout, locale, or direction-aware interaction risk.

**Offer:** compare Rawafid specialist findings/fixtures with the existing engine and produce an overlap/unique-coverage matrix.

**Ask:** review selected cases against the platform's current automation.

**Decision:** integrate only the cases that add defensible incremental signal. Rawafid does not position itself as a replacement for general accessibility testing.

## Localization and i18n platforms

**Problem:** structurally invalid catalogs, bidi isolation, script-sensitive fallback, localized numeric input, and pseudo-localization failures can survive a translation workflow.

**Offer:** provider-neutral structural/runtime QA around the existing localization system.

**Ask:** a representative catalog/workflow fixture and locale/script constraints — not production credentials by default.

**Boundary:** machine checks do not score translation quality or cultural appropriateness.

## Browser and visual-testing providers

**Problem:** some RTL regressions are browser, viewport, rendering, forced-color, or interaction specific.

**Offer:** a deterministic public RTL/LTR fixture suite that can be run on provider infrastructure after legitimate program acceptance or authorization.

**Ask:** provider-backed execution or review through the provider's normal OSS/integration process.

**Boundary:** test execution is interoperability evidence, not endorsement unless explicitly granted.

## CI, code-scanning, DevSecOps and AppSec

**Problem:** organizations need specialist findings to enter existing PR/code-scanning pipelines without adding another source-hosting SaaS.

**Offer:** offline source audit, JSON/SARIF, fail-closed policy, counted baseline migration, and first-party GitHub Action; the CLI remains portable to other CI systems.

**Ask:** run reporting-only on a representative repository, review noise, then deliberately test a high-confidence gate.

**Exit:** keep reporting-only or remove the scanner without changing application runtime behavior.

## Global products expanding to MENA

**Problem:** Arabic/RTL defects are often discovered late in localization, after design-system and product assumptions have hardened.

**Offer:** a readiness pilot on one critical product slice covering source risks, mixed-direction content, localized inputs, browser/keyboard behavior, and reusable CI invariants.

**Ask:** a representative non-sensitive flow/component set and engineering review.

**Value:** even a team that does not adopt the whole toolkit retains reproducible tests and a prioritized risk list.

## Standards and open-source foundations

**Problem:** standards work benefits from implementation evidence, while OSS projects can damage credibility by overstating conformance or institutional relationships.

**Offer:** contribute focused test cases, issue reproductions, translations, or evidence through the organization's normal public process.

**Ask:** technical review or program evaluation according to published procedures.

**Boundary:** accepted issues, citations, or applications do not become endorsement claims automatically.

## OSS infrastructure and developer-tooling programs

**Problem:** maintainers need security/build/test/localization infrastructure; providers need confidence their free OSS resources support a credible public project.

**Offer:** a provider-specific application backed by the public repository, license, CI/security/release contracts, external-consumer use, and a documented capability gap.

**Ask:** program review and, only if accepted, the provider resource under published terms.

**Boundary:** an application is not sponsorship. Provider branding/status is used only after authorization.

## Recommended outreach structure

A strong first message should normally contain five pieces, in this order:

1. **Their problem:** one concrete gap relevant to the recipient's product or program.
2. **Why Rawafid is relevant:** one or two capabilities, not the entire feature list.
3. **Evidence:** direct public link to the specific test, contract, Action, or evaluation profile.
4. **Low-friction pilot:** a small scope that can return a useful negative or positive result.
5. **Specific ask:** review a fixture, run a public suite, accept an issue, evaluate an OSS application, or nominate a component — not “let us partner” without a next action.

The full offer definitions, expected evidence, success conditions, and exits are in the machine-readable matrix. Outreach automation should choose the matching profile and still tailor the message to the actual organization before sending.
