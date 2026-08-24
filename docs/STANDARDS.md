# Standards baseline

Status reviewed: **2026-08-25**.

This project is implementation-oriented. Standards are used as normative or authoritative engineering inputs where applicable; a passing repository test is not a substitute for standards conformance testing of a consuming application.

## Accessibility

### WCAG 2.2

The current WCAG 2.2 W3C Recommendation is dated 12 December 2024:

- https://www.w3.org/TR/WCAG22/

The toolkit supports accessible implementation work around focus visibility, keyboard interaction, semantic markup, status announcements, motion preferences, reflow-resistant logical layout, and robust direction/language metadata. Importing the package does **not** make an application WCAG conformant. WCAG evaluation still requires the actual product/content/states and appropriate human testing.

### WAI-ARIA and Authoring Practices

Use native HTML first. ARIA should supplement semantics only where native elements do not express the required behavior.

- https://www.w3.org/TR/wai-aria-1.2/
- https://www.w3.org/WAI/ARIA/apg/

Keyboard and roving-focus helpers in this toolkit model **state transitions** only. The consuming application remains responsible for roles, accessible names, states/properties, relationships, DOM focus, and the complete interaction pattern.

## Language and direction

W3C Internationalization guidance is central to the design:

- https://www.w3.org/TR/string-meta/
- https://www.w3.org/International/questions/qa-html-dir.html
- https://www.w3.org/TR/i18n-html-tech-bidi/

Direction is treated as a property of the effective **script**, not a property of a language name. This is why explicit tags such as `az-Arab` and `az-Latn` resolve differently, and why `ar-Latn` is LTR despite the primary language subtag being Arabic.

Explicit HTML `lang`/`dir` metadata remains preferred over heuristic inference. `<bdi>`/Unicode isolates are appropriate tools for unknown or mixed-direction inline values when used with the correct product context.

## Locale identifiers and ECMA-402

Locale tags are canonicalized by the platform using BCP 47-compatible `Intl` APIs.

- BCP 47 / RFC 5646: https://www.rfc-editor.org/rfc/rfc5646
- ECMAScript Internationalization API: https://tc39.es/ecma402/

The package does not maintain a parallel private locale registry or private plural-rule database. It delegates standardized locale behavior to ECMA-402 services and the host implementation's locale data.

### Locale information

For direction, the toolkit prefers ECMA-402 Locale Info (`Intl.Locale#getTextInfo()` where available), accepts the older `textInfo` accessor shipped by some engines, and uses effective-script fallback for compatibility.

Capability inspection may also consume platform-exposed calendars, numbering systems, hour cycles, and other locale information only when those facilities are available. Missing runtime data is not invented by the toolkit.

### Plural rules

Plural-category selection is delegated to `Intl.PluralRules`, including range selection when the runtime exposes `selectRange()`. Application code should branch on returned categories rather than reimplementing per-language arithmetic rules.

### Display names

Localized names of languages, scripts, regions, currencies, calendars, and supported fields are delegated to `Intl.DisplayNames`. Exact wording is locale data and may evolve with host ICU/CLDR updates.

### Structured formatting

`formatToParts()` APIs are used where applications need structured localized output. Consumers should preserve emitted part order and avoid English-specific assumptions about sign, currency, date, list, or separator placement.

## Unicode text and bidirectional behavior

The stable project baseline is Unicode 17.0, released 9 September 2025.

- Unicode 17.0: https://www.unicode.org/versions/Unicode17.0.0/
- Unicode release announcement: https://blog.unicode.org/2025/09/unicode-170-release-announcement.html
- UAX #9 Unicode Bidirectional Algorithm, Unicode 17 / Revision 51: https://www.unicode.org/reports/tr9/
- UAX #29 Unicode Text Segmentation, Unicode 17 / Revision 47: https://www.unicode.org/reports/tr29/
- UTS #39 Unicode Security Mechanisms, Unicode 17 / Revision 32: https://www.unicode.org/reports/tr39/
- Garay Unicode 17 chart: https://www.unicode.org/charts/PDF/U10D40.pdf

### UAX #9 / bidi

Explicit embedding/override controls are treated as security-sensitive in untrusted display strings. Unicode isolates are supported as legitimate presentation metadata. The package does not attempt to reimplement the complete bidi layout algorithm performed by browsers/text engines.

### UAX #29 / segmentation

Grapheme, word, and sentence boundaries are obtained through `Intl.Segmenter`. The host runtime therefore owns the concrete Unicode segmentation data/algorithm version. Grapheme-safe utilities prevent UTF-16 code-unit slicing from being mistaken for user-perceived character slicing.

Word/sentence segmentation is a boundary service, not morphology, semantic parsing, tokenization for every NLP use case, or grammatical analysis.

### UTS #39 / security

UTS #39 specifies substantially more than mixed-script detection. The toolkit's Unicode display-risk diagnostics intentionally implement only limited defense-in-depth signals such as selected bidi controls, isolate imbalance, selected zero-width characters, and recognized mixed scripts.

The project does **not** claim full UTS #39 conformance, confusable skeleton matching, identifier restriction-level conformance, malware detection, or complete Trojan Source scanning unless those capabilities are implemented and verified separately in the future.

## Locale data / CLDR

CLDR 48.2.1 was released 8 July 2026. The toolkit intentionally consumes most locale behavior through the host runtime's `Intl` implementation instead of vendoring a CLDR data snapshot.

- CLDR 48 release series: https://cldr.unicode.org/downloads/cldr-48
- CLDR downloads: https://cldr.unicode.org/index/downloads

This means exact locale formatting, localized display names, preferred calendars, plural behavior, segment boundaries, punctuation, digits, and spacing can vary between supported runtime/browser versions as their ICU/CLDR/Unicode data changes. Such variation is part of the compatibility contract rather than something hidden by brittle snapshots.

## CSS and HTML

- CSS Writing Modes: https://www.w3.org/TR/css-writing-modes-4/
- CSS Logical Properties: https://www.w3.org/TR/css-logical-1/
- HTML `dir`: https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute
- HTML `bdi`: https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-bdi-element

The toolkit prefers logical properties and explicit HTML direction metadata. CSS is not used as a substitute for document direction semantics, and visual order must not be used to corrupt DOM/reading/focus order.

## Standards claims policy

When documentation names a standard, distinguish:

1. **design input** — the standard influenced the implementation;
2. **API delegation** — the host platform implements the relevant standardized API;
3. **repository regression evidence** — tests exercise the toolkit's documented contract;
4. **formal conformance/certification** — only claim this when the relevant standard actually defines such a claim and the required evaluation has been completed.

This repository normally makes claims in categories 1–3, not category 4.
