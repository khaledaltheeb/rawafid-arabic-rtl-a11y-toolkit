# Accessible reference patterns

This document describes the framework-neutral accessibility helpers in `src/a11y/patterns.ts` and the browser fixture at `/patterns`.

The helpers deliberately model only reusable state and semantic attributes. They do not claim to turn arbitrary markup into a conforming widget, and they do not own application lifecycle behavior.

## Public helpers

- `disclosureButtonAttributes` — builds semantic state for a native disclosure button.
- `menuButtonAttributes` — builds semantic state for a button that opens an ARIA menu.
- `menuOpenTargetFromKey` — resolves supported menu-button opening keys to first/last focus targets.
- `modalDialogAttributes` — builds modal-dialog semantics while enforcing an accessible-name source.
- `nextContainedTabIndex` — resolves circular Tab/Shift+Tab movement inside a contained sequence.

The tabs and pagination references do not add pattern-specific public helpers. Tabs compose `rovingTabIndexes` and `nextRovingFocusIndex`; pagination composes the existing `getPaginationModel` state helper. This keeps the core API conservative.

## Disclosure

`disclosureButtonAttributes(expanded, controlsId?)` returns the semantic state for a native disclosure button:

- `type="button"`
- `aria-expanded`
- optional `aria-controls` when a non-empty controlled element ID is supplied

The consumer owns the click handler, the controlled region, visibility, labels, and application state. Native button keyboard activation should not be replaced with a custom key emulation layer.

## Menu button

`menuButtonAttributes(expanded, menuId?)` returns:

- `type="button"`
- `aria-haspopup="menu"`
- `aria-expanded`
- optional `aria-controls`

`menuOpenTargetFromKey(key, includeArrowKeys?)` maps supported opening keys to a focus target:

- Enter or Space -> first item
- ArrowDown -> first item when arrow-key opening is enabled
- ArrowUp -> last item when arrow-key opening is enabled

It does not implement menu-item navigation, typeahead, disabled-item policy, Escape handling, or DOM focus. Existing roving-focus and typeahead primitives can be composed by the consuming component where appropriate.

## Tabs

The `/patterns` fixture includes a horizontal Arabic/RTL tablist built from native buttons and the existing roving-focus primitives. It demonstrates one automatic-activation composition:

- `role="tablist"` on the group;
- `role="tab"` plus `aria-controls` on each tab;
- exactly one tab with `tabindex="0"`, with the rest at `-1`;
- `aria-selected="true"` only on the active tab;
- `role="tabpanel"` plus `aria-labelledby` for each associated panel;
- only the active panel exposed;
- Home/End and direction-aware horizontal arrow movement through `nextRovingFocusIndex`;
- immediate panel activation because the fixture has no network or expensive-render latency.

The reference intentionally keeps DOM event handling and panel lifecycle outside the core package. Applications with expensive or asynchronous panel activation should consider manual activation rather than moving selection automatically with focus.

The WAI-ARIA Authoring Practices tabs pattern remains the semantic reference; this fixture is interoperability evidence for the toolkit's reusable navigation state, not a claim that every tab implementation composed from these helpers is conforming.

## Pagination

The `/patterns` fixture also composes `getPaginationModel` into a native page-navigation structure:

- a named `<nav>` landmark identifies the page-navigation region;
- page destinations are real links rather than buttons with simulated navigation;
- exactly one link uses `aria-current="page"` for the currently displayed page;
- previous and next destinations use `rel="prev"` and `rel="next"`;
- numeric links receive explicit Arabic accessible names while their visible labels stay compact;
- ellipsis gaps are non-interactive and hidden from the accessibility tree;
- DOM page order remains logical and is not reversed to imitate RTL visually.

WAI-ARIA explicitly defines the `page` token of `aria-current` for pagination links and recommends marking only one element in a related set as current. The native `<nav>` element supplies the navigation landmark. The toolkit model owns pagination state only; URL construction, routing, server fetching, and focus policy remain application responsibilities.

## Modal dialog

`modalDialogAttributes(options)` returns modal dialog semantics and requires an accessible-name source:

- `role="dialog"`
- `aria-modal="true"`
- either `aria-labelledby` or `aria-label`
- optional `aria-describedby`

`nextContainedTabIndex(currentIndex, itemCount, shiftKey?)` calculates circular Tab/Shift+Tab movement inside an ordered set of tabbable elements. It is a state helper, not a DOM focus trap.

A complete modal implementation still owns:

1. making outside content unavailable to interaction while the modal is active;
2. choosing and moving initial focus;
3. discovering the actual tabbable sequence after DOM changes;
4. intercepting Tab/Shift+Tab only while the modal is active;
5. Escape/close policy;
6. restoring focus to an appropriate element when the modal closes;
7. labeling and descriptive-content decisions;
8. nested-dialog policy and application-specific state.

The browser fixture composes `rememberFocus()`, `getFocusableElements()`, and `nextContainedTabIndex()` to exercise one conservative implementation. It is evidence for the toolkit primitives, not a universal application component.

## Verification surface

`tests/e2e/patterns.html` and `tests/e2e/patterns.spec.ts` verify the reference composition in the repository's Playwright matrix:

- disclosure state/visibility synchronization;
- menu keyboard opening and Escape focus restoration;
- RTL tabs semantics, single roving tab stop, automatic activation, Home/End, and direction-aware horizontal movement;
- pagination landmark naming, unique current-page state, previous/next relationships, and non-interactive gaps;
- modal semantics, initial focus, forward/reverse Tab containment, Escape close, and trigger focus restoration;
- axe-core automated accessibility checks.

Automated checks cannot establish complete accessibility conformance. Product semantics, assistive-technology behavior, content quality, and user testing remain separate responsibilities.

## Design boundary

These helpers remain in the core package because they are small, deterministic, framework-independent calculations or attribute builders. If future patterns require component lifecycle, portal ownership, framework context, or application state orchestration, they should be implemented as optional adapters or separate packages instead of widening the core runtime contract.
