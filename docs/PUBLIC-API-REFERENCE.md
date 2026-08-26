# Public API reference index

This index covers every reviewed runtime export from the package root. It is intentionally concise: behavioral contracts, standards boundaries, failure semantics, and examples remain in the dedicated topic documents. The documentation contract requires every reviewed runtime export to remain represented in Markdown when the public surface changes.

## RTL, direction, and bidi

- `BIDI` — exported bidi control/isolate constants used by the toolkit.
- `getLocaleDirection` — resolve LTR/RTL from the locale's effective script.
- `getTextDirection` — first-strong direction detection for text.
- `dirAttributes` — produce language/direction attributes for a locale.
- `bidiIsolate` — wrap content in an explicit Unicode directional isolate.
- `autoBidiIsolate` — choose an isolate direction from content.
- `containsBidiControls` — report explicit bidi-control presence.
- `stripBidiControls` — remove recognized bidi controls.
- `hasUnsafeBidiOverrides` — detect legacy embedding/override controls considered unsafe for ordinary display text.
- `stripUnsafeBidiOverrides` — remove those legacy embedding/override controls.
- `inlineSideToPhysical` — map logical inline side to physical side for a direction.
- `physicalSideToInline` — map physical side to logical inline side.

## Locale negotiation and capabilities

- `normalizeLocaleTag` — canonicalize a locale tag through platform Intl behavior.
- `localeFallbackChain` — construct deterministic locale fallback candidates.
- `selectBestLocale` — select an available locale without silently crossing script boundaries.
- `supportsLocale` — test whether a locale is supported under the toolkit's locale-selection contract.
- `getLocaleCapabilities` — inspect resolved script/region/direction and host-exposed locale capabilities.
- `supportedIntlValues` — expose standardized values reported by `Intl.supportedValuesOf` when available.

## Formatting, pluralization, display names, and catalogs

- `formatNumber` — locale-sensitive number formatting.
- `formatNumberParts` — structured number-format parts.
- `formatDate` — locale-sensitive date/time formatting.
- `formatDateParts` — structured date/time-format parts.
- `formatList` — locale-sensitive list formatting.
- `formatListParts` — structured list-format parts.
- `formatRelativeTime` — locale-sensitive relative-time formatting.
- `formatRelativeTimeParts` — structured relative-time-format parts.
- `selectPluralCategory` — cardinal or ordinal plural-category selection.
- `selectPluralRangeCategory` — runtime-gated plural category for a numeric range.
- `resolvePluralRules` — expose the configured/resolved native plural-rules object.
- `formatDisplayName` — format one standardized display-name code.
- `formatDisplayNames` — format a collection of standardized display-name codes.
- `resolveDisplayNames` — expose the configured/resolved native display-names object.
- `resolveMessage` — resolve a translation message through catalog fallback.
- `interpolateMessage` — interpolate catalog placeholders under the toolkit contract.
- `pseudoLocalize` — deterministic pseudo-localization for layout and localization QA.

## Terminology QA

- `auditTranslationTerminology` — deterministically evaluate one source/target translation unit against an explicit terminology profile.
- `auditCatalogTerminology` — apply the same terminology contract to matching keys across source and target message catalogs.
- `validateTerminologyProfile` — validate structural rule/profile defects without claiming semantic or linguistic correctness.
- `summarizeTerminologyFindings` — aggregate findings by severity and rule for CI/reporting surfaces.

The terminology engine deliberately does not infer semantic equivalence, diagnose translation quality in general, or ship organization-specific safeguarding/health/legal vocabularies. Profiles must explicitly state source triggers and target constraints. See [Terminology QA](./TERMINOLOGY-QA.md).

## Localized decimal input

- `getLocaleNumberSymbols` — derive decimal digits, separators, signs, bidi literals, and grouping sizes from the host `Intl.NumberFormat` runtime.
- `parseLocalizedDecimal` — strictly parse plain localized decimal input into a canonical ASCII lexical form and finite JavaScript number.

See [Localized decimal input](./NUMBER-INPUT.md) and [Localized number-input verification](./NUMBER-INPUT-VERIFICATION.md).

## Arabic and Unicode text

- `hasArabicScript` — detect Arabic-script characters.
- `stripArabicDiacritics` — remove supported Arabic combining marks.
- `normalizeArabicText` — conservative Arabic text normalization.
- `createArabicSearchKey` — create a stable Arabic-oriented search key under documented normalization rules.
- `compareArabic` — locale-aware comparison suitable for Arabic-oriented sorting/search contexts.
- `segmentHighlights` — return source-preserving structured highlight segments.
- `segmentGraphemes` — segment user-perceived grapheme clusters through `Intl.Segmenter`.
- `graphemeLength` — count grapheme clusters.
- `sliceGraphemes` — slice by grapheme boundaries.
- `truncateGraphemes` — truncate without splitting a grapheme cluster.
- `segmentWords` — locale-sensitive word segmentation including platform word-likeness metadata.
- `words` — extract word-like segments.
- `segmentSentences` — locale-sensitive sentence segmentation.
- `detectLetterScripts` — identify recognized scripts among letters in a string.
- `diagnoseUnicodeDisplay` — report selected Unicode display-risk signals without claiming full UTS #39 conformance.

## Decimal digit interoperability

- `detectDigitSystems` — identify supported decimal digit systems present in text.
- `containsMixedDigitSystems` — report whether more than one supported decimal digit system is present.
- `convertDigits` — explicitly convert supported decimal digit characters to a chosen supported digit set.
- `normalizeDigitsForSearch` — map supported decimal digit characters to ASCII digits while preserving punctuation and surrounding text.

## Keyboard, focus, typeahead, and selection

- `isActivationKey` — identify standard keyboard activation keys under the toolkit helper contract.
- `nextIndexFromKey` — calculate direction/orientation-aware movement for a linear collection.
- `firstEnabledIndex` — find the first enabled item.
- `lastEnabledIndex` — find the last enabled item.
- `nextRovingFocusIndex` — calculate the next active item for roving-focus state.
- `rovingTabIndexes` — produce the one-zero/rest-minus-one tabindex model for a composite.
- `findTypeaheadMatch` — locale-aware, grapheme-safe composite typeahead matching.
- `updateTypeaheadBuffer` — deterministic caller-owned typeahead buffer state.
- `normalizeSelection` — normalize active/selected state under single or multiple selection rules.
- `selectSingle` — apply single-selection behavior.
- `toggleMultiple` — toggle one item in multiple-selection state.
- `selectRange` — select an inclusive range while honoring disabled items.
- `isSelected` — query normalized selected state.

## Grid and UI state

- `gridPosition` — convert flat grid index to row/column coordinates.
- `gridIndex` — convert row/column coordinates to a flat grid index.
- `nextGridIndex` — calculate rectangular grid keyboard movement, including explicit RTL physical-arrow behavior.
- `getPaginationModel` — create direction-neutral pagination state.

## DOM accessibility helpers

- `getFocusableElements` — discover focusable descendants under the toolkit visibility/inert rules.
- `focusFirst` — focus the first eligible descendant.
- `rememberFocus` — capture a restoration closure for the currently focused element when possible.
- `announce` — make an SSR-safe ARIA live-region announcement when a DOM is present.

## Compatibility policy

The canonical runtime export snapshot is `api/public-api.json`; the generated TypeScript declaration fingerprint is governed separately. An API appearing in this index means it is part of the reviewed public surface. It does not imply that every consuming application automatically satisfies WCAG, ARIA Authoring Practices, Unicode security profiles, or locale-specific linguistic requirements.
