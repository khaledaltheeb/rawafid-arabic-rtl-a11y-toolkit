# RTL testing matrix

A serious RTL test suite should validate more than mirrored screenshots.

## Direction and language

- Root `lang` is valid and specific enough for the content.
- Root `dir` matches the page language.
- User-generated or mixed-direction inline values are isolated with `<bdi>` or Unicode isolates where appropriate.

## Layout

- Spacing uses logical properties.
- Icons that imply direction are mirrored only when semantically appropriate.
- Tables, breadcrumbs, pagination, carousels, drawers, and sidebars retain logical order.
- Horizontal overflow is checked at narrow mobile widths.

## Keyboard and focus

- DOM order and visual order agree.
- Tab order remains predictable.
- Horizontal arrow-key interactions account for RTL direction where the interaction model requires it.
- Focus indicators are visible on all interactive controls.

## Accessibility

- Semantic elements are preferred over ARIA recreations.
- Names, roles, values, live regions, and error messages are exposed correctly.
- Axe checks run in at least one desktop and one mobile viewport.
- Manual screen-reader testing is scheduled for components that depend on dynamic announcement or complex widgets.

## Localization

- Long translations do not clip or overlap.
- Number/date/list formatting uses the active locale.
- Translation placeholders remain consistent across locales.
- Missing messages have an explicit fallback policy.
