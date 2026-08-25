# Decimal digit systems

The toolkit treats decimal digit characters as a text interoperability concern that is separate from locale-aware number formatting and parsing.

## Supported text digit systems

The public text helpers recognize these three decimal digit sets:

| Identifier | Code points | Example |
| --- | --- | --- |
| `latn` | U+0030–U+0039 | `0123456789` |
| `arab` | U+0660–U+0669 | `٠١٢٣٤٥٦٧٨٩` |
| `arabext` | U+06F0–U+06F9 | `۰۱۲۳۴۵۶۷۸۹` |

The identifiers align with numbering-system identifiers used by the Unicode/ECMA-402 ecosystem. This module does not claim to implement every Unicode numeric character or every numbering system exposed by a runtime.

## Public helpers

### `detectDigitSystems(text)`

Returns the recognized systems, per-system counts, total recognized decimal-digit count, and whether more than one recognized system occurs in the source string.

Detection is descriptive. Mixed systems are not automatically classified as an error or security problem.

### `containsMixedDigitSystems(text)`

Convenience boolean based on `detectDigitSystems`.

### `convertDigits(text, targetSystem)`

Converts only recognized decimal digit code points to `latn`, `arab`, or `arabext`. Every other code point is preserved exactly.

This means the function intentionally does **not** reinterpret:

- decimal/group separators;
- signs;
- percent or currency symbols;
- dates;
- telephone numbers;
- account identifiers;
- Roman numerals, superscripts, circled numbers, or other Unicode numeric characters.

### `normalizeDigitsForSearch(text)`

Converts the three recognized decimal digit systems to ASCII/`latn` digits for search-key equivalence. The original source/display value should be retained separately whenever presentation matters.

For example:

```text
25
٢٥
۲۵
```

all normalize to the search key `25`.

## Integration

`createArabicSearchKey` normalizes recognized decimal digits after conservative Arabic text normalization. `findTypeaheadMatch` also normalizes these digit systems before locale-sensitive collation and grapheme-safe prefix matching.

As a result, a label beginning with `٢٥` can be found by a query beginning with `25` or `۲۵`, without changing the label shown to the user.

## Formatting remains an Intl responsibility

Digit conversion is not localized number formatting. Use `Intl.NumberFormat` or the toolkit formatting wrappers for user-facing numbers, including locale-specific grouping, decimal separators, signs, currencies, percentages, and numbering-system selection.

Do not parse a formatted number by merely replacing digits and stripping punctuation. Localized number parsing is a separate problem and is intentionally outside this text-normalization contract.

## Security and data integrity

Mixed digit systems can be useful diagnostics for identifiers or review workflows, but context determines whether mixing is legitimate. The toolkit therefore returns evidence rather than a risk verdict.

The helpers are deliberately conservative: they preserve punctuation and non-recognized numeric code points and never mutate the supplied string.
