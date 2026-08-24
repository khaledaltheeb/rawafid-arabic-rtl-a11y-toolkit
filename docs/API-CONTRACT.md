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

## Pseudo-localization contract

`pseudoLocalize` is a localization QA utility, not translation. By default it decorates/accent-transforms human-readable copy while preserving common `{placeholder}`, printf-style, HTML-like tag, and entity tokens. Consumers should use invented/test content and should not treat pseudo-localized strings as natural-language output.

## Grapheme contract

`segmentGraphemes`, `graphemeLength`, `sliceGraphemes`, and `truncateGraphemes` operate through `Intl.Segmenter` grapheme boundaries. This prevents common UTF-16 slicing errors involving combining marks and emoji sequences. Exact segmentation follows the running platform's Unicode/ICU implementation.

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

Programmer-state errors such as invalid pagination ranges, invalid keyboard indices, invalid grapheme truncation lengths, or invalid roving-focus indices throw `RangeError`. Invalid locale direction input uses the documented fallback behavior. Date formatting rejects invalid date values.

## Formatting variability

`Intl` output is platform data. Changes in browser/runtime ICU and CLDR versions may legitimately alter punctuation, digits, spacing, names, segmentation, or formatting conventions without a toolkit code change. Consumers should avoid asserting byte-for-byte localized output when the exact wording is not part of their own product contract.
