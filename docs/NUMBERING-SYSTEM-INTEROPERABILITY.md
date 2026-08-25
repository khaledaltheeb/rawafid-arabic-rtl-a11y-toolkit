# Numbering-system interoperability corpus

`tests/fixtures/numbering-system-interoperability-corpus.json` is an independently authored set of Unicode locale-extension vectors for exercising decimal formatting and parsing across Arabic-script and Latin-digit configurations.

## Why this matters

Arabic-language products do not have one universal digit presentation. A locale may use Arabic-Indic digits, Eastern Arabic-Indic digits, Western digits, or a caller-selected numbering system. Numbering-system choice also affects decimal/grouping symbols and may interact with bidi formatting literals.

Testing only literal strings such as `١٢٣` and `123` therefore misses the actual interoperability boundary between locale identifiers, `Intl.NumberFormat`, runtime locale data, and application parsing.

## Standards basis

The corpus is informed by:

- Unicode LDML / CLDR Part 3: Numbers and its BCP 47 `nu` numbering-system keyword;
- ECMA-402 `Intl.Locale` and `Intl.NumberFormat` behavior.

Unicode LDML explicitly permits selecting a numbering system through a Unicode locale identifier, for example `ar-u-nu-latn` for Arabic with Western digits.

## Stability strategy

The corpus deliberately uses explicit `-u-nu-...` locale extensions instead of asserting mutable locale defaults. For example:

- `ar-EG-u-nu-arab`;
- `ar-EG-u-nu-latn`;
- `fa-IR-u-nu-arabext`;
- `fa-IR-u-nu-latn`.

This makes the regression contract about interoperability, not about freezing one CLDR release's default preferences.

## What each vector verifies

For each case the automated test checks that:

1. `Intl.Locale(...).numberingSystem` reflects the explicit Unicode extension;
2. `Intl.NumberFormat(...).resolvedOptions().numberingSystem` agrees;
3. `getLocaleNumberSymbols()` extracts ten distinct digits plus the locale's decimal/group/sign data;
4. a value formatted by the platform can be parsed by `parseLocalizedDecimal()` back to the original numeric value;
5. the toolkit reports the same resolved numbering system throughout the round trip.

## Evidence boundary

This is not a complete CLDR or ECMA-402 conformance suite. It is a focused interoperability corpus for the public behavior the toolkit owns. Runtime locale data remains supplied by the JavaScript engine/ICU implementation, and future corpus additions should prefer explicit locale extensions where a mutable default would otherwise create a brittle assertion.
