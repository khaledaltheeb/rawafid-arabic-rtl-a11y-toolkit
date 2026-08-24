# Architecture

The package keeps a framework-neutral core so it can be consumed by React, Vue, Svelte, server-rendered applications, static sites, and plain JavaScript.

- `src/rtl`: direction detection, locale direction, bidi safety, logical-side mapping.
- `src/i18n`: locale fallback, message resolution, platform `Intl` formatters.
- `src/a11y`: keyboard, focus, and live-region helpers.
- `src/text`: Arabic presentation/search normalization and safe highlighting segments.
- `src/ui`: presentation-independent UI state models such as pagination.
- `styles`: direction-safe CSS and accessibility utilities.
- `tests/unit`: deterministic logic tests.
- `tests/e2e`: browser-level RTL and accessibility checks.

Framework adapters should remain thin and be added as separate entry points only when the core API cannot express the behavior cleanly.
