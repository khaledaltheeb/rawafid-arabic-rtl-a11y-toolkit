# Localized number-input verification

This document records the regression evidence for the toolkit's localized plain-decimal input layer. It is an evidence map, not a claim that the toolkit implements every number-writing convention used by every locale.

## Evidence layers

### Source contract

Unit tests validate explicit grammar and failure states: locale-native digits, optional ASCII compatibility, opt-in Arabic digit flexibility, signs, decimal separators, grouping, invalid characters, malformed grouping, trailing decimals, exponent rejection, non-finite values, bidi formatting literals, and original-input error offsets.

### Runtime-derived global matrix

A deterministic matrix formats the same finite decimal values using the host `Intl.NumberFormat`, then parses that actual output back through `parseLocalizedDecimal()` using locale-native digit policy.

The current matrix covers representative behavior from:

- Arabic with `arab` digits (`ar-JO`);
- Persian with `arabext` digits (`fa-IR`);
- US English;
- Indian English and Hindi grouping behavior;
- French space-like grouping;
- German decimal/group ordering;
- Bengali with `beng` digits.

The assertions intentionally focus on properties owned by the toolkit: successful round-trip of host-formatted plain decimals, resolved numbering-system consistency, ten distinct decimal digit tokens, structural grouping validation, and rejection of cross-locale separator misuse.

The matrix does **not** freeze display strings, localized sign glyph wording, or the complete CLDR repertoire. Those remain host-runtime data and may evolve with ICU/CLDR/Unicode updates.

### Built package

The package contract imports the real generated `dist/index.js` in Node and verifies representative Arabic and Indian-grouping parsing behavior. This catches bundling/export regressions that source tests alone cannot detect.

### Installed tarball

The external-consumer gate installs the actual `npm pack` tarball into a clean temporary project and verifies package-name runtime imports and strict TypeScript consumption. Public declaration and runtime-export snapshots are checked independently.

### Browsers

Playwright loads the built package in Chromium, Firefox, WebKit, and mobile Chromium. Browser tests verify runtime-formatted Arabic negative round-trip, Indian grouping, and explicit Arabic digit-flex policy.

## Precision boundary

`normalized` is the canonical ASCII lexical result for the accepted plain-decimal grammar. `value` is a JavaScript `number` and therefore follows IEEE-754 precision and negative-zero semantics. The test matrix includes negative zero explicitly and rejects magnitudes that convert to non-finite values.

Consumers that require exact arbitrary-precision decimal arithmetic should operate on `normalized` with a decimal arithmetic implementation appropriate to their application.

## Change policy

A change to locale-input behavior should be reviewed at four levels:

1. Is the change required by the toolkit's documented grammar or merely by one runtime's incidental locale data?
2. Does it preserve the separation between formatting, lexical parsing, and arbitrary-precision arithmetic?
3. Does it broaden accepted input in a way that could create ambiguity or reinterpret identifiers?
4. Does it change the public TypeScript declaration surface or runtime exports, requiring the corresponding compatibility snapshots to change?

New locale cases should prefer invariant/property assertions over hard-coded localized display strings unless the code point itself is the capability under test.
