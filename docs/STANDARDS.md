# Standards baseline

Status reviewed: **2026-08-24**.

This project is implementation-oriented. Standards are used as normative or authoritative design inputs where applicable; a test passing in this repository is not a substitute for conformance testing of a consuming application.

## Accessibility

### WCAG 2.2

W3C Recommendation dated 12 December 2024:

- https://www.w3.org/TR/WCAG22/

The toolkit is designed to support accessible implementations, especially around focus visibility, keyboard interaction, semantic markup, status announcements, motion preferences, and robust direction/language metadata. It does not claim that importing the package makes an application WCAG-conformant.

### WAI-ARIA

Use native HTML first. ARIA should supplement semantics only where native elements do not express the required behavior.

- https://www.w3.org/TR/wai-aria-1.2/
- https://www.w3.org/WAI/ARIA/apg/

## Language and direction

W3C Internationalization guidance is central to the design:

- https://www.w3.org/TR/string-meta/
- https://www.w3.org/International/questions/qa-html-dir.html
- https://www.w3.org/TR/i18n-html-tech-bidi/

Direction is treated as a property of the effective **script**, not a property of a language name. This is why explicit tags such as `az-Arab` and `az-Latn` resolve differently, and why `ar-Latn` is LTR despite the primary language subtag being Arabic.

## Locale identifiers

Locale tags are canonicalized by the platform using BCP 47-compatible `Intl` APIs.

- BCP 47 / RFC 5646: https://www.rfc-editor.org/rfc/rfc5646
- ECMAScript Internationalization API: https://tc39.es/ecma402/

The package does not maintain a parallel private locale registry. For direction, it prefers ECMA-402 Locale Info (`Intl.Locale#getTextInfo()` where available), accepts the older `textInfo` accessor shipped by some engines, and falls back to script metadata for compatibility.

## Unicode and bidirectional text

Current production baseline at review time is Unicode 17.0, released 9 September 2025.

- Unicode 17.0: https://www.unicode.org/versions/Unicode17.0.0/
- UAX #9 Unicode Bidirectional Algorithm: https://www.unicode.org/reports/tr9/
- Garay (Unicode 17 chart): https://www.unicode.org/charts/PDF/U10D40.pdf
- UTS #39 Unicode Security Mechanisms: https://www.unicode.org/reports/tr39/

Explicit embedding/override controls are treated as security-sensitive in untrusted display strings. Isolation controls are supported as legitimate presentation metadata.

## Locale data

CLDR 48.2.1 was released 8 July 2026. The toolkit intentionally consumes locale behavior through the host runtime's `Intl` implementation instead of vendoring a CLDR data snapshot.

- https://cldr.unicode.org/downloads/cldr-48

This means exact locale formatting can vary between supported runtime/browser versions as their ICU/CLDR data changes. Such variation is documented as a compatibility characteristic rather than hidden by brittle snapshots.

## CSS and HTML

- CSS Writing Modes: https://www.w3.org/TR/css-writing-modes-4/
- CSS Logical Properties: https://www.w3.org/TR/css-logical-1/
- HTML `dir`: https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute

The toolkit prefers logical properties and explicit HTML direction metadata. CSS is not used as a substitute for document direction semantics.
