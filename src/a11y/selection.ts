export type SelectionMode = 'single' | 'multiple';

export type SelectionState = {
  activeIndex: number;
  selected: readonly number[];
};

export type SelectionOptions = {
  disabled?: readonly boolean[];
  allowEmpty?: boolean;
};

function assertItemCount(itemCount: number): void {
  if (!Number.isInteger(itemCount) || itemCount < 0) {
    throw new RangeError('itemCount must be a non-negative integer.');
  }
}

function assertIndex(index: number, itemCount: number, name: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= itemCount) {
    throw new RangeError(`${name} must be an integer between 0 and ${itemCount - 1}.`);
  }
}

function enabled(index: number, disabled: readonly boolean[]): boolean {
  return disabled[index] !== true;
}

function uniqueSorted(indices: readonly number[]): number[] {
  return [...new Set(indices)].sort((a, b) => a - b);
}

export function normalizeSelection(
  itemCount: number,
  activeIndex: number,
  selected: readonly number[],
  mode: SelectionMode,
  options: SelectionOptions = {},
): SelectionState {
  assertItemCount(itemCount);
  if (itemCount === 0) return { activeIndex: -1, selected: [] };
  assertIndex(activeIndex, itemCount, 'activeIndex');

  const disabled = options.disabled ?? [];
  const normalized = uniqueSorted(selected);
  for (const index of normalized) assertIndex(index, itemCount, 'selected index');
  const enabledSelection = normalized.filter((index) => enabled(index, disabled));

  if (mode === 'single' && enabledSelection.length > 1) {
    throw new RangeError('single selection mode accepts at most one selected index.');
  }

  return {
    activeIndex,
    selected: enabledSelection,
  };
}

export function selectSingle(
  state: SelectionState,
  index: number,
  itemCount: number,
  options: SelectionOptions = {},
): SelectionState {
  assertItemCount(itemCount);
  if (itemCount === 0) return { activeIndex: -1, selected: [] };
  assertIndex(index, itemCount, 'index');
  const disabled = options.disabled ?? [];
  if (!enabled(index, disabled)) return normalizeSelection(itemCount, state.activeIndex, state.selected, 'single', options);
  return { activeIndex: index, selected: [index] };
}

export function toggleMultiple(
  state: SelectionState,
  index: number,
  itemCount: number,
  options: SelectionOptions = {},
): SelectionState {
  assertItemCount(itemCount);
  if (itemCount === 0) return { activeIndex: -1, selected: [] };
  assertIndex(index, itemCount, 'index');
  const disabled = options.disabled ?? [];
  const current = normalizeSelection(itemCount, state.activeIndex, state.selected, 'multiple', options);
  if (!enabled(index, disabled)) return current;

  const selected = new Set(current.selected);
  if (selected.has(index)) {
    if (options.allowEmpty === false && selected.size === 1) return { activeIndex: index, selected: [...selected] };
    selected.delete(index);
  } else {
    selected.add(index);
  }

  return { activeIndex: index, selected: [...selected].sort((a, b) => a - b) };
}

export function selectRange(
  state: SelectionState,
  anchorIndex: number,
  focusIndex: number,
  itemCount: number,
  options: SelectionOptions = {},
): SelectionState {
  assertItemCount(itemCount);
  if (itemCount === 0) return { activeIndex: -1, selected: [] };
  assertIndex(anchorIndex, itemCount, 'anchorIndex');
  assertIndex(focusIndex, itemCount, 'focusIndex');
  const disabled = options.disabled ?? [];
  const start = Math.min(anchorIndex, focusIndex);
  const end = Math.max(anchorIndex, focusIndex);
  const range: number[] = [];
  for (let index = start; index <= end; index += 1) {
    if (enabled(index, disabled)) range.push(index);
  }
  return {
    activeIndex: focusIndex,
    selected: range,
  };
}

export function isSelected(state: SelectionState, index: number): boolean {
  return state.selected.includes(index);
}
