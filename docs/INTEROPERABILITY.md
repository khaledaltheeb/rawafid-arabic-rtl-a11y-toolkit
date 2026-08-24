# Interoperability and integration

The toolkit is intentionally framework-agnostic. Its public JavaScript API models text, locale, direction, accessibility interaction state, and formatting behavior without owning a rendering framework.

## Integration targets

The core package is suitable for direct use from:

- browser ESM applications;
- Node.js build/test tooling on supported runtimes;
- React, Vue, Svelte, Solid, Angular, Lit, and other frameworks through ordinary JavaScript imports;
- server-rendered applications, provided DOM-specific helpers are called only when a document is available;
- design-system packages that need direction-aware primitives without inheriting a framework dependency.

Framework adapters may be added later as optional packages or entry points. They must not force a framework dependency into the core package.

## Direction contract at application boundaries

Applications should treat direction as explicit document/component metadata:

1. Set valid `lang` and `dir` on the document root.
2. Use effective-script direction for locale-derived decisions.
3. Use `<bdi>` or isolation for unknown/mixed-direction inline values such as emails, identifiers, usernames, versions, and codes.
4. Give intrinsically LTR input values, such as many email addresses and URLs, an explicit `dir="ltr"` when that improves editing behavior.
5. Prefer CSS logical properties instead of duplicating RTL/LTR styles.

The toolkit can calculate and test these decisions, but applications remain responsible for applying correct markup.

## Accessibility contract at application boundaries

State helpers such as `nextRovingFocusIndex` and `rovingTabIndexes` deliberately do not create ARIA widgets. Consumers must provide the role, name, state, relationship, DOM focus, and pattern-specific behavior appropriate to their component.

This separation keeps the core reusable while preventing a generic helper from claiming conformance for a component whose semantics it cannot see.

## Localization workflow

A recommended localization QA pipeline is:

1. validate source/target catalogs for key and placeholder parity;
2. run pseudo-localization to expose clipping, fixed-width assumptions, and token corruption;
3. exercise both LTR and RTL locales;
4. run real-browser tests at desktop and narrow/mobile sizes;
5. perform human linguistic and accessibility review before production release.

Pseudo-localization is synthetic QA output and must never be represented as a real translation.

## Unicode and untrusted values

Use `diagnoseUnicodeDisplay` as a policy signal when displaying untrusted identifiers or labels. A mixed-script or bidi-control result can justify additional review, isolation, escaping, or product-specific restrictions.

Do not use the helper as evidence that a string is malicious or safe. Complete identifier security policies may require Unicode security profiles, confusable data, product context, and human/security review beyond this package.

## Browser evidence

The repository's controlled browser fixture verifies the built package itself across Chromium, Firefox, WebKit, and mobile Chromium. Scenarios cover:

- Arabic document direction and script-specific overrides;
- mixed Arabic/English/email/identifier content;
- logical CSS behavior;
- form fields with differing value direction;
- breadcrumb and tabular mixed-direction content;
- RTL roving focus with a disabled item;
- live-region output;
- pseudo-localization, grapheme-safe truncation, and Unicode risk diagnostics;
- horizontal overflow checks;
- automated axe checks on the controlled fixture.

Automated axe results are a regression gate, not a substitute for manual accessibility evaluation.

## Compatibility philosophy

Localized output is partly determined by the host engine's ICU/CLDR and ECMA-402 implementation. Consumers should test behavior rather than freeze incidental punctuation or spacing unless their own product contract requires exact output.

See `docs/API-CONTRACT.md`, `docs/COMPATIBILITY.md`, `docs/GLOBAL-PLATFORM.md`, and `docs/TEST-MATRIX.md` for the detailed contracts.
