# Test matrix

## Unit tests

### Direction

- first-strong RTL/LTR text behavior;
- explicit and likely script direction;
- thirteen supported RTL script families;
- counterexample: RTL-language primary subtag with explicit Latin script;
- invalid locale fallback.

### Bidi

- isolates;
- ALM/directional marks;
- control detection/removal;
- distinction between legacy overrides/embeddings and isolation controls.

### Localization

- canonical fallback chains;
- region fallback;
- no cross-script same-language fallback;
- empty availability behavior;
- `Intl` formatters;
- message fallback and placeholder interpolation.

### Arabic text

- Arabic-script detection;
- standard and extended Arabic combining marks;
- conservative normalization;
- stable search keys.

### UI

- LTR/RTL arrow semantics;
- invalid navigation state;
- logical side mapping;
- pagination invariants;
- safe structured highlighting;
- locale case-expansion boundary preservation.

## Browser tests

Playwright first builds the package, starts the repository's controlled local fixture, and loads the actual `dist/index.js` plus the published CSS entry points in:

- Chromium desktop;
- Firefox desktop;
- WebKit desktop;
- Chromium mobile profile.

Assertions cover:

- the built toolkit loads successfully and computes script-aware direction in-browser;
- document `lang` and `dir`;
- zero axe violations in the controlled fixture;
- keyboard focus order;
- logical inline-start mapping under RTL;
- mixed-direction `<bdi>` values;
- live-region behavior from the built toolkit;
- horizontal overflow.

## Manual testing still required in consuming products

Automation does not replace:

- screen-reader testing with product-specific dynamic content;
- zoom/reflow and text-spacing review;
- high-contrast/forced-colors product review;
- localization review by fluent speakers;
- complex widget interaction testing;
- real content stress cases and long translations.
