# Public API contract

## Philosophy

The public API is intentionally small, framework-neutral, ESM-first, side-effect-light, and based on platform standards. Runtime JavaScript has no third-party dependencies.

## Stability

- `0.x`: APIs are usable but may change when standards/edge-case testing reveals a design flaw.
- Every breaking change requires a changelog entry and migration note.
- `1.0.0`: exported names and documented behavior become SemVer-stable.

Internal modules not exported from `src/index.ts` are not public API.

## Direction contract

`getLocaleDirection(locale, fallback)`:

- canonicalizes the locale with `Intl`;
- determines the effective script, using an explicit script when present or likely-subtag maximization otherwise;
- returns RTL only for known RTL scripts;
- never assumes every use of a language has one direction;
- returns the caller-provided fallback for an invalid locale.

`getTextDirection(text, fallback)` implements first-strong behavior for supported RTL scripts versus other Unicode letters. It is a heuristic for strings without explicit direction metadata, not a replacement for authoritative metadata.

## Bidi contract

- isolate helpers wrap strings with Unicode isolate controls.
- `stripUnsafeBidiOverrides` removes legacy U+202A..U+202E embedding/override controls only.
- `stripBidiControls` removes the explicit control set supported by this package.
- no bidi function promises source-code sanitization or confusable detection.

## Locale negotiation and capability contract

`selectBestLocale` never silently crosses effective script boundaries during same-language fallback. Default locale selection remains explicit.

`getLocaleCapabilities(locale)` returns canonical language/script/region/direction and uses runtime ECMA-402 locale-info methods or equivalent accessors when available. Calendars, numbering systems, and hour cycles may therefore be empty on engines that do not expose those APIs. The function does not fabricate CLDR metadata.

`supportsLocale(locale, constructors)` reports whether the requested locale is supported by the selected built-in `Intl` constructors. It does not guarantee that every locale-sensitive API or every desired calendar/numbering-system extension is available.

## Segmentation contract

`segmentGraphemes`, `graphemeLength`, `sliceGraphemes`, and `truncateGraphemes` operate through `Intl.Segmenter` grapheme boundaries. This prevents common UTF-16 slicing errors involving combining marks and emoji sequences. Exact segmentation follows the running platform's Unicode/ICU implementation.

`segmentWords(value, locale)` returns every locale-sensitive word-boundary segment and carries the runtime-provided `isWordLike` signal. `words()` is the convenience form that returns only word-like segments. Punctuation and whitespace are not considered word-like when the host marks them otherwise.

`segmentSentences(value, locale)` returns locale-sensitive sentence-boundary segments. Sentence segmentation is a Unicode/platform boundary service, not semantic or linguistic parsing. Applications must not infer meaning, reading level, authorship, or grammatical correctness from these boundaries.

## Plural rules contract

`selectPluralCategory(value, locale, options)` delegates cardinal/ordinal plural category selection to `Intl.PluralRules`. It rejects non-finite numeric values. Arabic can therefore expose categories such as `zero`, `one`, `two`, `few`, `many`, and `other` according to the host's locale data.

`selectPluralRangeCategory(start, end, locale, options)` uses `Intl.PluralRules.prototype.selectRange` when the runtime provides it and fails explicitly when that capability is unavailable. It does not synthesize a range category from endpoint categories.

`resolvePluralRules()` exposes the runtime-resolved options for auditing. Consumers should branch on plural categories, not hard-code language-specific arithmetic rules in application code.

## Display-name contract

`formatDisplayName` and `formatDisplayNames` delegate standardized code naming to `Intl.DisplayNames`. They support the code types exposed by the host/type baseline, such as languages, regions, scripts, currencies, calendars, and date-time fields. When `fallback: 'none'` is requested, a missing name may produce `undefined`.

Translated display names are locale data, not package-owned copy. Their exact spelling, punctuation, capitalization, or terminology may change with ICU/CLDR updates without a SemVer change in this toolkit.

## Structured formatting contract

`formatNumberParts`, `formatDateParts`, `formatListParts`, and `formatRelativeTimeParts` expose the corresponding `Intl.*.formatToParts()` structures. These APIs are preferred when an application needs semantic styling, direction isolation, annotation, or component rendering around localized pieces.

Consumers must preserve the emitted part order and must not rebuild localized output using English-centric assumptions about separators, signs, currencies, list conjunctions, or date ordering.

## Pseudo-localization contract

`pseudoLocalize` is a localization QA utility, not translation. By default it decorates/accent-transforms human-readable copy while preserving common `{placeholder}`, printf-style, HTML-like tag, and entity tokens. Consumers should use invented/test content and should not treat pseudo-localized strings as natural-language output.

## Unicode display-risk contract

`detectLetterScripts` reports recognized script families among Unicode letters while ignoring Common/Inherited characters.

`diagnoseUnicodeDisplay` provides defense-in-depth signals for:

- explicit bidi controls;
- legacy bidi embedding/override controls;
- unbalanced Unicode isolate controls;
- selected zero-width format characters;
- strings containing letters from more than one recognized script family.

These diagnostics are not a complete Unicode Technical Standard #39 confusable implementation, identifier security profile, malware scanner, or Trojan Source/source-code analyzer. A mixed-script result is a signal for policy review, not proof of malicious content.

## Arabic normalization contract

Normalization is deliberately conservative and intended for search/display keys. It is not stemming, morphology, transliteration, diagnosis, terminology mapping, or semantic equivalence.

By default it may:

- remove Arabic-script combining marks;
- remove tatweel;
- normalize common Alef variants.

It does not map `ة` to `ه`, and it does not collapse other distinct Arabic letters without an explicit option.

## Accessibility interaction contract

`nextIndexFromKey` and roving-focus helpers model keyboard/index state only. They do not create DOM widgets, assign ARIA roles, or assert that a consuming widget conforms to WAI-ARIA Authoring Practices.

`nextRovingFocusIndex` skips disabled items and respects horizontal RTL/LTR direction, vertical orientation, Home/End, and optional looping. `rovingTabIndexes` emits a single-tab-stop model for enabled items. The consuming application remains responsible for focus calls, semantic HTML, labels, states, roles, and pattern-specific interaction behavior.

## Accessibility DOM contract

DOM utilities are safe to import in SSR/non-DOM environments. Functions requiring a document either accept one or degrade to a no-op where appropriate. Importing the package must not read `document` eagerly.

## Error contract

Programmer-state errors such as invalid pagination ranges, invalid keyboard indices, invalid grapheme truncation lengths, invalid roving-focus indices, invalid dates, and non-finite plural values throw `RangeError` where documented. Invalid locale direction input uses the documented fallback behavior. Unsupported optional runtime capabilities fail explicitly rather than silently emulating standards behavior.

## Formatting and locale-data variability

`Intl` output and segmentation are platform data. Changes in browser/runtime ICU, Unicode, and CLDR versions may legitimately alter punctuation, digits, spacing, names, segment boundaries, plural behavior for corrected locale data, or formatting conventions without a toolkit code change. Consumers should avoid asserting byte-for-byte localized output when the exact wording is not part of their own product contract.
