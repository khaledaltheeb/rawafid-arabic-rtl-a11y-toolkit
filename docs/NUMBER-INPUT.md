# Localized decimal input

Formatting a number and parsing human-entered localized numeric text are different problems. ECMA-402 standardizes `Intl.NumberFormat` formatting and exposes resolved locale/numbering-system information and structured `formatToParts()` output; it does not define a general `Intl.NumberParser`.

This toolkit therefore implements localized decimal input as a narrow, explicit contract derived from the host `Intl.NumberFormat` runtime rather than by hard-coding locale punctuation tables.

## APIs

- `getLocaleNumberSymbols(locale, options)` discovers the resolved locale, numbering system, ten decimal digit tokens, decimal separator, grouping separator, plus/minus signs, and primary/secondary grouping sizes.
- `parseLocalizedDecimal(input, locale, options)` validates a finite plain decimal input and returns either a success object or a typed failure reason.

## Accepted grammar

The parser accepts:

- an optional leading localized or ASCII plus/minus sign;
- decimal digits from the resolved locale numbering system;
- ASCII digits by default;
- the locale decimal separator;
- locale grouping separators when grouping is enabled and structurally valid;
- leading-decimal forms such as `.5` or the locale equivalent.

It does not silently interpret:

- exponent notation;
- currency or percent decorations;
- `Infinity` or `NaN`;
- arbitrary Unicode numeric characters;
- grouping separators in the fractional part;
- malformed grouping;
- a trailing decimal separator with no fractional digits.

## Digit acceptance policy

`digitAcceptance` is explicit:

- `locale`: only the digits emitted by the resolved locale numbering system;
- `locale-and-latn` (default): locale digits plus ASCII `0`–`9`;
- `arabic-flex`: locale digits plus ASCII, Arabic-Indic U+0660..U+0669, and Extended Arabic-Indic U+06F0..U+06F9.

`arabic-flex` is opt-in because accepting a different digit set is an input policy decision, not an inherent property of every locale.

## Grouping validation

Grouping sizes are derived from a large value formatted by the same `Intl.NumberFormat` instance. The rightmost group must match the primary grouping size; interior groups must match the secondary size; the leftmost group may be shorter. This supports patterns such as Western `1,234,567` and Indian `12,34,567` without assuming grouping is always three digits.

Grouping validation is lexical. It does not require users to include grouping separators when the locale formatter would normally display them.

## Output and precision

A successful result contains:

- `normalized`: canonical ASCII plain-decimal lexical form, with `.` as the decimal point and no grouping;
- `value`: the corresponding JavaScript `number`;
- the resolved locale and numbering system.

The `normalized` string is the lossless lexical result of this parser's accepted grammar. The `value` follows JavaScript `Number` precision semantics and may round very large finite decimals. Inputs whose numeric conversion is non-finite are rejected. Consumers that require arbitrary-precision decimal arithmetic should use `normalized` with a dedicated decimal library rather than treating `value` as arbitrary precision.

## Boundaries and non-claims

- Parsing is based on the host ICU/CLDR/Unicode data exposed through `Intl.NumberFormat`; resolved output may vary with the runtime.
- This API parses plain decimal values only. It is not a currency parser, percent parser, accounting parser, scientific-notation parser, or generic Unicode-number parser.
- It does not rewrite the user's display string. The original input remains caller-owned.
- Phone numbers, account identifiers, document numbers, and similar identifiers should not be passed to numeric parsing merely because they contain digits.
- The API does not claim that all culturally valid informal ways of writing numbers are accepted. Its purpose is a deterministic, auditable input contract.
