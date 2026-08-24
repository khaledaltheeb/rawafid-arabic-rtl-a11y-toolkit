# Composite selection state

The toolkit keeps **focus/active state** separate from **selection state**.

This distinction is intentional. In composite widgets, moving the active item is not universally equivalent to selecting it. Different interaction patterns may use selection-follows-focus, explicit activation, toggle selection, range selection, or application-specific behavior.

## Public primitives

- `normalizeSelection(itemCount, activeIndex, selected, mode, options)` validates and normalizes state.
- `selectSingle(state, index, itemCount, options)` applies explicit single selection.
- `toggleMultiple(state, index, itemCount, options)` toggles one item in a multi-select model.
- `selectRange(state, anchorIndex, focusIndex, itemCount, options)` creates an inclusive enabled-item range.
- `isSelected(state, index)` tests membership without DOM assumptions.

## Disabled items

Disabled items are never added to normalized or new selection state. Range selection skips disabled indices rather than treating them as selectable values.

The consuming component still decides whether focus may land on disabled-but-focusable descendants for a particular pattern. These state helpers do not make that policy decision.

## Active versus selected

`activeIndex` models the currently active/focused logical item. `selected` models selected logical items.

For example, a single-selection list can legally have:

```ts
{
  activeIndex: 0,
  selected: [2],
}
```

until the application chooses to commit selection. The toolkit does not silently synchronize the two states.

## Multiple selection

`toggleMultiple` supports a caller-controlled `allowEmpty` policy. When `allowEmpty: false`, attempting to remove the last selected item preserves it.

`selectRange` is intentionally stateless with respect to the anchor. The consuming widget owns the anchor lifecycle because pointer, keyboard, Shift, platform conventions, and product interaction policy differ.

## Accessibility boundary

These helpers do **not**:

- create DOM nodes;
- assign `role`, `aria-selected`, `aria-current`, or `aria-activedescendant`;
- move browser focus;
- implement Shift/Ctrl/Meta key policy;
- choose selection-follows-focus versus explicit selection;
- claim conformance with a WAI-ARIA Authoring Practices pattern.

They provide deterministic state transitions that consuming components can map onto an appropriate semantic pattern.

## Integration with keyboard primitives

A typical composite can combine:

1. `nextRovingFocusIndex` to resolve direction-aware active movement;
2. application policy to decide whether movement also commits selection;
3. `selectSingle`, `toggleMultiple`, or `selectRange` to update selected state;
4. semantic HTML/ARIA and explicit focus management in the consuming component.

This separation makes the same core usable for listbox-like, tree-like, grid-like, tab-like, and custom composite interaction models without embedding one pattern's semantics into the toolkit.
