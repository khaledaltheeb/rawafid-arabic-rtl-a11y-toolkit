# Global engineering platform layer

The toolkit is designed as a reusable engineering layer for multilingual, bidirectional, and accessible web interfaces. It remains framework-agnostic and content-independent.

## Design principles

1. **Script-aware, not language-name-aware.** Direction is derived from the effective writing script.
2. **Unicode-safe boundaries.** User-visible string operations should respect grapheme clusters instead of UTF-16 code units.
3. **Platform-first internationalization.** Prefer standardized `Intl`/ECMA-402 behavior and runtime CLDR data over hand-maintained locale folklore.
4. **Accessibility behavior without DOM ownership.** Keyboard/focus state helpers model behavior while applications remain responsible for semantic HTML and ARIA.
5. **Security diagnostics without exaggerated claims.** Unicode/bidi helpers expose display-risk signals but are not represented as a complete UTS #39 confusable implementation or source-code scanner.
6. **Testability as a feature.** Pseudo-localization and deterministic state helpers exist to make localization, overflow, keyboard, and browser regressions easier to exercise.
7. **Zero runtime dependencies.** Core behavior remains based on JavaScript/Web Platform primitives.

## Capability layers

### Direction and bidirectional text

- effective-script locale direction
- first-strong text direction
- Unicode isolates and bidi controls
- logical/physical inline mapping
- bidi-control stripping and diagnostics

### Internationalization

- canonical locale tags and script-safe negotiation
- locale fallback chains
- number/date/list/relative-time formatting
- translation catalog validation/interpolation
- runtime locale capability introspection
- pseudo-localization for UI QA

### Unicode and Arabic text

- conservative Arabic normalization
- Arabic combining-mark handling
- grapheme segmentation, length, slicing, and truncation
- locale-aware highlight segmentation
- mixed-script/zero-width/bidi display-risk diagnostics

### Accessibility interaction

- direction-aware keyboard navigation
- roving-tabindex state generation
- disabled-item-aware composite navigation
- focus discovery/restoration
- SSR-safe live regions
- accessibility utility CSS

### Verification

- strict TypeScript
- unit tests
- real-browser Playwright coverage
- axe-core automated accessibility checks
- package-shape validation
- CodeQL and dependency review
- supply-chain pin checks

## Standards relationship

The project follows relevant concepts from WCAG 2.2, WAI-ARIA Authoring Practices, Unicode Bidirectional Algorithm guidance, Unicode security guidance, BCP 47, ECMA-402, CLDR-backed platform behavior, and CSS logical properties.

Standards references are engineering inputs, not certifications. The toolkit does not by itself make an application WCAG conformant, fully secure against Unicode spoofing, linguistically correct for every language, or compliant with every ARIA pattern. Applications must still choose correct semantics, interaction patterns, threat models, translations, and human accessibility testing.

## Scope boundary

This layer contains reusable software only. It does not contain Rawafid scientific/editorial content, production databases, user data, proprietary publishing/SEO logic, or private infrastructure. See `OPEN_SOURCE_SCOPE.md` and `docs/PROJECT-IDENTITY.md`.
