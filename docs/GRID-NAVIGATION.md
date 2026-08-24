# Direction-aware grid navigation

`nextGridIndex()` models keyboard movement in a rectangular grid without creating DOM, ARIA, editing, or selection behavior.

## Index model

The flat index follows DOM/logical inline order:

```text
0 1 2 3
4 5 6 7
8 9 A B
```

`gridPosition()` converts a flat index into `{ row, column }`; `gridIndex()` performs the inverse conversion.

## Horizontal direction

Horizontal arrow keys represent physical arrow-key intent while the column index follows logical/DOM order.

- LTR: `ArrowRight` increases column; `ArrowLeft` decreases it.
- RTL: `ArrowRight` decreases logical column; `ArrowLeft` increases it.

Vertical movement is independent of text direction.

## Data-grid default

`wrapRows` defaults to `false`. At a row edge, horizontal movement remains in the current cell. This conservative behavior is appropriate for data-grid-like navigation, where wrapping can disorient users.

## Layout-grid opt-in

Consumers that intentionally implement a linear/wrapping layout grid may set `wrapRows: true`. Horizontal movement can then cross from the end of one row to the beginning of the next (and vice versa).

This is an interaction policy switch, not an ARIA-role inference.

## Home, End, and paging

- `Home`: first logical cell in the current row.
- `End`: last logical cell in the current row.
- `ctrlKey: true` + `Home`: first cell in the grid.
- `ctrlKey: true` + `End`: last cell in the grid.
- `PageUp` / `PageDown`: move by caller-supplied `pageRows`, clamped to grid boundaries.

The toolkit does not decide how many rows constitute a visual page because viewport size, virtualization, sticky headers, row heights, and application layout are host concerns.

## Accessibility boundary

These helpers do not:

- create `role="grid"`, rows, cells, or headers;
- decide whether focus belongs on a cell or an element inside it;
- manage editing mode inside cells;
- implement `aria-rowindex`, `aria-colindex`, sorting, or virtualization metadata;
- select cells, rows, or columns;
- intercept browser keyboard events;
- claim APG conformance for the consuming grid.

They provide deterministic focus-index calculations that an application can combine with its semantic grid implementation and selection/editing policies.

## Standards rationale

The WAI-ARIA Authoring Practices Grid pattern describes directional arrow navigation, row-level `Home`/`End`, grid-level `Control+Home`/`Control+End`, optional page movement, and an important distinction between non-wrapping data grids and layout grids where wrapping may be useful. This module keeps those policies explicit rather than silently applying layout-grid behavior to tabular data.
