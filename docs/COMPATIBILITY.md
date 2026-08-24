# Compatibility policy

Reviewed: 2026-08-24.

## Node.js

Supported release lines:

- Node 22 LTS
- Node 24 LTS

Forward-compatibility CI also runs on Node 26 Current. Node 20 is not supported because it reached end-of-life in March 2026.

The package declares `node >=22`.

## Browsers

Automated Playwright coverage includes:

- Chromium desktop
- Firefox desktop
- WebKit desktop
- Chromium mobile profile

The source targets modern evergreen browsers with ES2022 support and the relevant `Intl` APIs. Internet Explorer and legacy non-evergreen browser engines are not supported.

## Required web-platform capabilities

Core locale/text features depend on:

- Unicode property escapes in regular expressions
- `Intl.Locale`
- `Intl.Segmenter`
- `Intl.Collator`
- `Intl.NumberFormat`
- `Intl.DateTimeFormat`
- `Intl.ListFormat`
- `Intl.RelativeTimeFormat`

DOM accessibility helpers additionally require modern DOM APIs when executed in a browser. They remain safe to import in SSR.

## Runtime locale data

The package does not bundle CLDR. Formatting and likely-subtag behavior come from the runtime's ICU/CLDR implementation. The CI matrix is intended to reveal meaningful cross-version changes.

## Compatibility changes

Dropping a supported Node LTS line or browser family is a documented compatibility change and must appear in the changelog. Before 1.0 it may occur in a minor release; after 1.0 it requires a major release unless driven by an urgent security requirement with a documented exception.
