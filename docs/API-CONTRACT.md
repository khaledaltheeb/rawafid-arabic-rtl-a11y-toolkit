# Public API contract

## Philosophy

The public API is intentionally small, framework-neutral, ESM-first, side-effect-light, and based on platform standards. Runtime JavaScript has no third-party dependencies.

## Stability

- `0.x`: APIs are usable but may change when standards/edge-case testing reveals a design flaw.
- Every breaking change requires a changelog entry and migration note.
- `1.0.0`: exported names and documented behavior become SemVer-stable.

Internal modules not exported from `src/index.ts` are not public API.

## Direction contract

`getLocaleDirection(locale, fallback)` canonicalizes the locale with `Intl`, resolves the effective script, returns RTL only for known RTL scripts, never assumes a language name has one direction, and returns the caller fallback for invalid input.

`getTextDirection(text, fallback)` implements first-strong behavior for supported RTL scripts versus other Unicode letters. It is a heuristic for strings without authoritative direction metadata.

## Bidi contract

- isolate helpers wrap strings with Unicode isolate controls;
- `stripUnsafeBidiOverrides` removes legacy embedding/override controls only;
- `stripBidiControls` removes the explicit control set supported by the package;
- no bidi function claims source-code sanitization or complete confusable detection.

## Locale negotiation and capability contract

`selectBestLocale` never silently crosses effective-script boundaries during same-language fallback.

`getLocaleCapabilities(locale)` returns canonical language/script/region/direction and runtime-exposed calendars, numbering systems, hour cycles, collations, time zones, and week information. Missing runtime capabilities remain empty/absent rather than being fabricated.

`supportedIntlValues(kind)` delegates to `Intl.supportedValuesOf` and fails explicitly when unavailable instead of maintaining a private registry.

`supportsLocale(locale, constructors)` reports support in the selected built-in `Intl` constructors; it does not guarantee every locale extension or desired calendar/numbering system.

## Segmentation contract

`segmentGraphemes`, `graphemeLength`, `sliceGraphemes`, and `truncateGraphemes` use `Intl.Segmenter` grapheme boundaries and avoid common UTF-16 slicing errors.

`segmentWords(value, locale)` exposes locale-sensitive word boundaries plus host-provided `isWordLike`; `words()` returns only word-like segments.

`segmentSentences(value, locale)` exposes locale-sensitive sentence boundaries. It is not semantic, grammatical, authorship, or readability analysis.

Exact segmentation follows the running platform's Unicode/ICU implementation.

## Plural rules contract

`selectPluralCategory(value, locale, options)` delegates cardinal/ordinal selection to `Intl.PluralRules` and rejects non-finite numeric values.

`selectPluralRangeCategory(start, end, locale, options)` uses native `selectRange` when available and fails explicitly when unavailable; it does not synthesize a category from endpoint categories.

`resolvePluralRules()` exposes runtime-resolved options. Consumers should branch on returned categories rather than hard-code language arithmetic.

## Display-name contract

`formatDisplayName` and `formatDisplayNames` delegate standardized code naming to `Intl.DisplayNames`. Locale-data wording may change with ICU/CLDR without a toolkit SemVer change.

## Structured formatting contract

`formatNumberParts`, `formatDateParts`, `formatListParts`, and `formatRelativeTimeParts` expose the corresponding `Intl.*.formatToParts()` structures.

Consumers must preserve emitted part order and must not reconstruct localized output from English-centric assumptions about separators, signs, currency placement, conjunctions, or date ordering.

## Pseudo-localization contract

`pseudoLocalize` is a localization QA utility, not translation. It can transform/expand human-readable copy while preserving common placeholders, printf-style tokens, HTML-like tags, and entities.

## Unicode display-risk contract

`detectLetterScripts` reports recognized script families among Unicode letters while ignoring Common/Inherited characters.

`diagnoseUnicodeDisplay` provides defense-in-depth signals for bidi controls, legacy overrides, isolate imbalance, selected zero-width format characters, and mixed recognized scripts.

These diagnostics are not a complete UTS #39 confusable implementation, identifier security profile, malware scanner, or Trojan Source analyzer. A risk is a review signal, not proof of malicious content.

## Arabic normalization contract

Arabic normalization is deliberately conservative and intended for search/display keys. It is not stemming, morphology, transliteration, terminology mapping, or semantic equivalence. It does not map `ة` to `ه` or collapse distinct letters without an explicit option.

## Accessibility interaction contract

`nextIndexFromKey` and roving-focus helpers model keyboard/index state only. They do not create DOM widgets, assign roles, or assert WAI-ARIA Authoring Practices conformance.

`nextRovingFocusIndex` skips disabled items and respects horizontal RTL/LTR direction, orientation, Home/End, and optional looping. `rovingTabIndexes` derives a single-tab-stop model. The host remains responsible for focus calls and semantics.

### Locale-aware typeahead

`findTypeaheadMatch(items, query, options)` performs locale-sensitive prefix matching over enabled labels with `Intl.Collator` search semantics and grapheme-safe prefix boundaries. It returns an index only.

`updateTypeaheadBuffer(previous, input, timestamp, timeoutMs)` provides deterministic buffer-state logic. The host owns timers, keyboard-event filtering, modifier shortcuts, composition/IME handling, focus, selection, and pattern-specific behavior.

### Composite selection

`normalizeSelection`, `selectSingle`, `toggleMultiple`, `selectRange`, and `isSelected` model selection state independently from active/focus state.

The contract intentionally permits states such as `{ activeIndex: 0, selected: [2] }`. The toolkit does not silently implement selection-follows-focus.

- disabled indices are excluded from normalized/new selection;
- single mode permits at most one selected index;
- multiple mode can optionally disallow an empty selection;
- range selection is inclusive and skips disabled indices;
- the host owns the selection anchor lifecycle, modifier-key policy, DOM focus, roles, and ARIA states.

### Rectangular grid navigation

`gridPosition` and `gridIndex` convert between a flat logical/DOM-order index and `{ row, column }` coordinates in a rectangular grid.

`nextGridIndex(currentIndex, rowCount, columnCount, key, options)` calculates movement without mutating DOM or selection.

- horizontal physical-arrow behavior is direction-aware;
- in RTL, `ArrowRight` moves toward the previous logical column and `ArrowLeft` toward the next logical column;
- vertical movement is direction-independent;
- `Home`/`End` target the current row;
- `ctrlKey: true` with Home/End targets the entire grid;
- `PageUp`/`PageDown` use caller-provided `pageRows` and clamp at boundaries;
- `wrapRows` defaults to `false` for conservative data-grid behavior and is an explicit opt-in for layout-grid-style wrapping.

The grid helpers do not create `role="grid"`, choose cell-vs-descendant focus, implement editing mode, assign row/column ARIA metadata, select cells/rows/columns, manage virtualization, or claim APG conformance.

See `docs/COMPOSITE-INTERACTIONS.md`, `docs/SELECTION-MODELS.md`, and `docs/GRID-NAVIGATION.md`.

## Accessibility DOM contract

DOM utilities are safe to import in SSR/non-DOM environments. Functions requiring a document either accept one or degrade to a no-op where appropriate. Importing the package must not eagerly read `document`.

## Built package contract

`npm run package:contract` builds the distributable package and imports the real `dist/index.js` in a non-DOM Node environment.

It validates:

- root JavaScript/declaration export mapping;
- required CSS/package subpaths;
- representative public exports;
- SSR-safe import behavior;
- script-direction behavior;
- locale-aware typeahead;
- active-vs-selected independence;
- physical RTL grid movement and row Home behavior.

This gate complements source tests, `publint`, and Are The Types Wrong because a correct source tree can still produce a broken distributable through export-map drift, missing declarations, eager DOM access, or bundling mistakes.

## Error contract

Programmer-state errors such as invalid pagination ranges, keyboard/grid indices, grid coordinates/dimensions, grapheme truncation lengths, roving-focus/typeahead indices, invalid dates, non-finite timestamps, invalid page-row sizes, and non-finite plural values throw `RangeError` where documented.

Invalid locale direction input uses its documented fallback. Unsupported optional runtime capabilities fail explicitly rather than silently emulating standards behavior.

## Formatting and locale-data variability

`Intl` output, segmentation, collation, display names, week metadata, plural behavior, and supported-value lists are platform data. Browser/runtime ICU, Unicode, and CLDR updates may legitimately change these results without a toolkit code change. Consumers should test package-owned invariants rather than freeze incidental localized wording or data lists.
