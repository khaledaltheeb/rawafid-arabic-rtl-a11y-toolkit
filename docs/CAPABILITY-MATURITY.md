# Capability maturity model

This document classifies toolkit capabilities by engineering maturity. It prevents a large API surface from being mistaken for uniform standards conformance or production readiness in every consuming product.

## Maturity levels

- **Foundation** — implemented, unit-tested, and covered by the core compatibility contract.
- **Browser-verified** — Foundation plus exercised through the built package in the real-browser Playwright matrix.
- **Operationally hardened** — Browser-verified or non-browser equivalent plus repeated CI/security/package-gate evidence and documented failure/non-claim boundaries.
- **External-evidence pending** — implementation may be ready, but a claim depends on an external account, provider, publication, or program approval.

Maturity describes this repository only. It does not transfer automatically to a consuming application.

## Capability matrix

| Capability | Maturity | Evidence / boundary |
| --- | --- | --- |
| Script-aware locale direction | Operationally hardened | Unit + browser evidence; explicit script overrides; modern RTL script families |
| First-strong text direction | Foundation | Unit-tested heuristic; authoritative `dir` metadata remains preferred |
| Unicode bidi isolation/control helpers | Operationally hardened | Unit-tested and integrated into mixed-direction browser scenarios |
| Logical inline/physical side mapping | Browser-verified | Real computed-style RTL verification |
| Script-safe locale negotiation | Operationally hardened | Unit-tested cross-script fallback prevention |
| Number/date/list/relative-time formatting | Foundation | Native `Intl`; exact localized output remains host-data dependent |
| Locale capability inspection | Foundation | Native/dynamic ECMA-402 information only; unavailable data is not fabricated |
| Catalog validation | Operationally hardened | CI gate for parity/placeholders/empty strings/legacy bidi controls |
| Pseudo-localization | Browser-verified | Unit + built-browser execution; QA output only |
| Arabic normalization | Operationally hardened | Conservative tested behavior; not morphology/semantic equivalence |
| Grapheme-safe slicing/truncation | Browser-verified | `Intl.Segmenter`; emoji/cluster unit tests + browser execution |
| Locale-aware highlighting | Foundation | Structured segments; no HTML generation |
| Unicode display-risk diagnostics | Browser-verified | Mixed-script/bidi/zero-width/isolate signals; explicitly not full UTS #39 |
| Direction-aware keyboard navigation | Operationally hardened | Unit-tested RTL/LTR/vertical/Home/End/loop behavior |
| Roving focus/tabindex state | Browser-verified | Real RTL tablist fixture including disabled-item skipping |
| Focus discovery/restoration | Foundation | SSR-safe and hidden/inert-aware; consuming widget semantics remain external |
| ARIA live-region helper | Browser-verified | Built package creates/updates plain-text polite status region |
| Pagination state model | Foundation | Direction-neutral state tests; rendering semantics remain consumer-owned |
| Accessibility utility CSS | Browser-verified | Loaded by controlled fixture; axe regression gate and focus/skip-link evidence |
| Node/package compatibility | Operationally hardened | Node 22/24/26 CI, tsdown, publint, ATTW |
| Supply-chain workflow pinning | Operationally hardened | Full-SHA verification + Dependabot maintenance |
| CodeQL / Dependency Review | Operationally hardened | Repeated GitHub PR validation |
| npm public package / first publication | Operationally hardened | `@rawafid/arabic-rtl-a11y-toolkit@0.3.0` is publicly released; exact package tarball, release notes, SPDX SBOM, and registry-integrity verification are recorded for v0.3.0 |
| npm OIDC provenance publication | External-evidence pending | v0.3.0 was a one-time bootstrap publication; future normal release still requires verified package-level Trusted Publisher binding and a successful OIDC/provenance publication |
| BrowserStack/Transifex/etc. program integration | External-evidence pending | Provider acceptance must be verified independently |
| GitHub protected-main ruleset | External-evidence pending | Repository-settings state must be directly verified; `main` is not currently protected |

## Promotion requirements

A capability should move upward only when the evidence genuinely changes.

### Foundation -> Browser-verified

Applicable browser-facing behavior should:

- execute from the built package rather than copied test logic;
- be tested across the maintained Playwright projects where relevant;
- include negative/counterexample behavior when practical;
- avoid exact locale-output assertions that are not owned by this package.

### Browser-verified -> Operationally hardened

The capability should additionally demonstrate:

- repeated successful CI cycles;
- stable package/type resolution;
- documented compatibility/error/non-claim behavior;
- security/scope implications where relevant;
- no unresolved high-severity defect in its supported contract.

### External-evidence pending -> verified external state

Record:

- provider/account identity;
- exact configuration or release;
- date/evidence source;
- renewal/expiry conditions where relevant;
- what the provider approval actually covers.

Do not generalize one provider approval into unrelated compliance or certification claims.

## Institutional principle

The goal is not maximum badge count. The goal is a repository where **implementation, test evidence, documentation, release claims, and external-account state agree with each other**. If any layer is uncertain, the public claim should be narrower than the implementation rather than broader.
