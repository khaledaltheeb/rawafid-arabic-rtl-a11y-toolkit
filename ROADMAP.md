# Roadmap

The roadmap prioritizes standards correctness and reusable engineering value over feature count.

## 0.2 - Hardened foundation (current)

- Script-aware direction across modern RTL script families.
- Bidi control/isolation safety helpers.
- Script-safe locale negotiation and `Intl` formatting.
- Conservative Arabic text/search helpers.
- Direction-aware keyboard navigation.
- SSR-safe accessibility primitives.
- Logical CSS utilities.
- Cross-browser Playwright + axe matrix.
- Package-shape validation.
- CodeQL, Dependency Review, OpenSSF Scorecard, SHA-pinned workflow gate.
- OIDC/provenance release design.
- Threat model, compatibility contract, quality gates, and scope guard.

## 0.3 - Interoperability and fixtures

- More mixed-script form, table, breadcrumb, dialog, menu, and data-visualization fixtures.
- Visual RTL/LTR comparison fixtures with stable non-content-specific examples.
- Translation-service workflow adapters/examples for qualifying open-source providers.
- Optional CI adapters for BrowserStack/TestMu after program approval.

## 0.4 - Framework adapters

- Thin optional React/Next.js adapters in separate entry points/packages.
- Accessible reference patterns for roving tabindex, pagination, and direction-aware navigation.
- No framework dependency in the core package.

## 0.5 - Unicode/i18n depth

- Expanded script-direction conformance fixtures.
- Confusable-awareness documentation and optional inspection helpers without destructive normalization.
- More locale-negotiation property tests.

## 1.0 - Stable API

- Public API frozen under SemVer.
- Sustained browser/runtime compatibility evidence.
- Public release/provenance history.
- Maintainer/reviewer process operating successfully with external contributions.
