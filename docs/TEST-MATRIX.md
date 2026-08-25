# Test matrix

## Unit tests

### Direction and bidi

- first-strong RTL/LTR text behavior;
- explicit and likely script direction;
- thirteen supported RTL script families;
- RTL-language primary subtag with explicit Latin script;
- invalid locale fallback;
- isolates, ALM/directional marks, control detection/removal, and legacy override/isolation distinctions.

### Localization and locale intelligence

- canonical fallback chains and region fallback;
- no silent cross-script same-language fallback;
- empty availability behavior;
- number/date/list/relative-time formatting and structured parts;
- cardinal/ordinal plural categories, including Arabic categories;
- runtime-gated plural-range behavior;
- display names;
- locale capability shape including runtime-exposed calendars, numbering systems, hour cycles, collations, time zones, and week information;
- `Intl.supportedValuesOf` capability behavior;
- message fallback and placeholder interpolation;
- pseudo-localization token preservation and deterministic expansion.

### Unicode and Arabic text

- Arabic-script detection;
- standard and extended Arabic combining marks;
- conservative normalization and stable search keys;
- grapheme-safe length/slicing/truncation;
- locale-sensitive word and sentence segmentation;
- safe structured highlighting and locale case-expansion boundary preservation;
- Unicode display-risk diagnostics for bidi controls, isolate imbalance, zero-width characters, and mixed recognized scripts.

### Composite interaction

- LTR/RTL arrow semantics;
- invalid navigation state;
- roving focus and disabled-item skipping;
- locale-aware typeahead and deterministic buffer expiry;
- modifier/composition policy remains host-owned;
- single/multiple/range selection;
- active focus remains independent from selected state;
- disabled items are excluded from selection;
- selection non-empty policy;
- grid index/position conversion;
- LTR/RTL physical horizontal grid movement;
- vertical movement and row boundaries;
- data-grid no-wrap default;
- layout-grid row-wrap opt-in;
- Home/End and Control+Home/End;
- caller-defined PageUp/PageDown movement;
- invalid grid dimensions, coordinates, indices, and page size;
- logical side mapping and pagination invariants.

## Built-package contract

`npm run package:contract` first builds the real package and imports `dist/index.js` in non-DOM Node.

It verifies:

- root JavaScript/declaration export mapping;
- CSS/package subpath presence;
- representative public export presence;
- SSR/non-DOM import safety;
- script-aware direction behavior;
- locale-aware typeahead from built output;
- active-vs-selected selection independence from built output;
- RTL grid physical left/right movement and row Home behavior from built output.

This supplements source unit tests and package-shape tools rather than duplicating them.

## Browser tests

Playwright first builds the package, starts the controlled local fixture, and loads the actual `dist/index.js` plus published CSS entry points in:

- Chromium desktop;
- Firefox desktop;
- WebKit desktop;
- Chromium mobile profile.

Assertions cover:

- successful built-toolkit loading and script-aware direction in-browser;
- document `lang` and `dir`;
- zero axe violations in the complete controlled fixture;
- keyboard focus order and skip-link behavior;
- logical inline-start mapping under RTL;
- mixed-direction `<bdi>` values and intrinsically LTR email input;
- live-region behavior from the built toolkit;
- RTL roving tab movement and disabled-item skipping;
- built-package locale-aware typeahead;
- modified shortcut and IME/composition non-consumption;
- semantic 2×3 RTL grid structure;
- one grid cell in the page tab sequence;
- physical RTL ArrowLeft/ArrowRight movement;
- vertical grid movement;
- grid Home/End behavior;
- pseudo-localization, grapheme-safe truncation, and Unicode-risk helpers from built output;
- horizontal document overflow regression.

## Repository/security matrix

Every pull request also passes, when applicable:

- Node 22 quality lane;
- Node 24 quality lane;
- Node 26 forward-compatibility lane;
- CodeQL JavaScript/TypeScript analysis;
- Dependency Review;
- SHA-pinned GitHub Action validation through the project supply-chain check.

## Manual testing still required in consuming products

Repository automation does not replace:

- screen-reader testing with product-specific dynamic content;
- zoom/reflow and text-spacing review;
- high-contrast/forced-colors product review;
- localization review by fluent speakers;
- product-specific complex-widget semantics and interaction testing;
- editing modes inside grids;
- virtualization and large-data behavior;
- real content stress cases and long translations;
- formal WCAG or APG conformance evaluation of the consuming application.
