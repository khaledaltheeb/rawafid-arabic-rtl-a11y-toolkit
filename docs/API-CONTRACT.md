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

## Locale negotiation contract

`selectBestLocale` never silently crosses effective script boundaries during same-language fallback. Default locale selection remains explicit.

## Arabic normalization contract

Normalization is deliberately conservative and intended for search/display keys. It is not stemming, morphology, transliteration, diagnosis, terminology mapping, or semantic equivalence.

By default it may:

- remove Arabic-script combining marks;
- remove tatweel;
- normalize common Alef variants.

It does not map `ة` to `ه`, and it does not collapse other distinct Arabic letters without an explicit option.

## Accessibility DOM contract

DOM utilities are safe to import in SSR/non-DOM environments. Functions requiring a document either accept one or degrade to a no-op where appropriate. Importing the package must not read `document` eagerly.

## Error contract

Programmer-state errors such as invalid pagination ranges or invalid keyboard indices throw `RangeError`. Invalid locale direction input uses the documented fallback behavior. Date formatting rejects invalid date values.

## Formatting variability

`Intl` output is platform data. Changes in browser/runtime ICU and CLDR versions may legitimately alter punctuation, digits, spacing, names, or formatting conventions without a toolkit code change. Consumers should avoid asserting byte-for-byte localized output when the exact wording is not part of their own product contract.
