# Composite interaction architecture

Rawafid's public interaction layer is deliberately **composable**, not a collection of pre-styled widgets.

The toolkit separates four concerns that are often incorrectly fused together:

1. **movement** — where the active logical item should move;
2. **typeahead** — which enabled item matches locale-aware typed input;
3. **selection** — which logical items are selected independently of focus;
4. **host semantics** — DOM focus, HTML/ARIA roles and states, editing, rendering, and product policy.

This makes the primitives reusable across tabs, listboxes, menus, trees, grids, toolbars, command surfaces, and other composite interfaces without pretending that one interaction model is universally correct.

## Linear movement

Use:

- `nextIndexFromKey()` for simple indexed navigation;
- `nextRovingFocusIndex()` when disabled items, orientation, RTL horizontal behavior, and looping are relevant;
- `rovingTabIndexes()` to derive a single-tab-stop tabindex model.

The host owns the actual `.focus()` call and semantic pattern.

## Locale-aware typeahead

Use:

- `updateTypeaheadBuffer()` for deterministic accumulated query state;
- `findTypeaheadMatch()` for locale-sensitive prefix matching over enabled labels.

The matcher uses platform collation and grapheme boundaries. It does not use ASCII-only lowercasing and does not split grapheme clusters.

The host must filter keyboard events. In particular, an application should decide how to treat modifier shortcuts and input-method composition. The repository browser fixture demonstrates one conservative policy: printable unmodified keys participate in typeahead while `event.isComposing` and Ctrl/Meta/Alt combinations are not consumed.

## Selection

Use:

- `normalizeSelection()`;
- `selectSingle()`;
- `toggleMultiple()`;
- `selectRange()`;
- `isSelected()`.

`activeIndex` and `selected` are separate state. This permits either selection-follows-focus or explicit selection without forcing either policy into the toolkit.

## Rectangular grids

Use:

- `gridPosition()`;
- `gridIndex()`;
- `nextGridIndex()`.

The index follows logical/DOM inline order. Physical horizontal arrows are direction-aware: RTL reverses logical column movement for Left/Right while vertical movement is unchanged.

Data-grid behavior is conservative by default: row edges do not wrap. `wrapRows` is an explicit opt-in for layout-grid-style movement. Page movement is parameterized by `pageRows` because the library cannot know the consuming viewport or virtualization window.

## Layering example

A complex host component can use the layers in this order:

```text
KeyboardEvent
   |
   +-- composing/modifier/editing policy owned by host
   |
   +-- printable key ---------> typeahead buffer + locale match
   |
   +-- navigation key --------> linear or grid movement primitive
   |
   +-- product selection rule -> selection primitive
   |
   +-- host DOM/ARIA update ---> focus, roles, states, labels, rendering
```

No toolkit function needs to know the framework or render tree.

## Verification layers

The interaction architecture is verified at three levels:

### Source logic

Vitest covers normal paths, boundaries, disabled states, RTL/LTR differences, invalid indices, range selection, paging, wrapping, and locale-aware matching.

### Built package

`npm run package:contract` imports the real `dist/index.js` in non-DOM Node and executes representative direction, typeahead, selection, and RTL grid invariants. This catches bundling/export drift that source tests alone cannot catch.

### Real browsers

The Playwright fixture consumes `/dist/index.js` and exercises:

- RTL roving tabs;
- disabled-item skipping;
- locale-aware typeahead;
- modified-shortcut and composition boundaries;
- a semantic two-row, three-column RTL grid;
- physical left/right movement;
- vertical row movement;
- Home/End behavior;
- a single page-tab stop;
- automated axe regression checks across the complete fixture.

The browser matrix remains Chromium, Firefox, WebKit, and mobile Chromium.

## Explicit non-claims

These primitives do not automatically make a consuming application WCAG-conformant or an ARIA Authoring Practices pattern conformant.

They do not decide:

- which ARIA role is appropriate;
- whether a cell or an element inside it owns focus;
- whether selection follows focus;
- editing-mode entry/exit;
- pointer behavior;
- virtualization metadata;
- assistive-technology announcements beyond explicit live-region utilities;
- framework component lifecycle.

Those decisions require the consuming product's semantics, content, interaction model, and accessibility testing.
