import { describe, expect, it } from 'vitest';
import {
  isSelected,
  normalizeSelection,
  selectRange,
  selectSingle,
  toggleMultiple,
} from '../../src/a11y/selection';

describe('composite selection state', () => {
  it('normalizes, deduplicates, sorts, and removes disabled selections', () => {
    expect(normalizeSelection(5, 2, [4, 2, 2, 1], 'multiple', { disabled: [false, true] })).toEqual({
      activeIndex: 2,
      selected: [2, 4],
    });
  });

  it('keeps active focus and single selection as separate state concepts', () => {
    const initial = normalizeSelection(4, 0, [2], 'single');
    expect(initial).toEqual({ activeIndex: 0, selected: [2] });
    expect(selectSingle(initial, 3, 4)).toEqual({ activeIndex: 3, selected: [3] });
  });

  it('does not select disabled items', () => {
    const state = { activeIndex: 0, selected: [0] } as const;
    expect(selectSingle(state, 1, 3, { disabled: [false, true, false] })).toEqual(state);
  });

  it('toggles multiple selection and can enforce non-empty selection', () => {
    const initial = { activeIndex: 0, selected: [0] } as const;
    const added = toggleMultiple(initial, 2, 4);
    expect(added).toEqual({ activeIndex: 2, selected: [0, 2] });
    expect(toggleMultiple(added, 0, 4)).toEqual({ activeIndex: 0, selected: [2] });
    expect(toggleMultiple({ activeIndex: 2, selected: [2] }, 2, 4, { allowEmpty: false })).toEqual({ activeIndex: 2, selected: [2] });
  });

  it('creates inclusive ranges while excluding disabled items', () => {
    expect(selectRange({ activeIndex: 1, selected: [1] }, 1, 4, 6, {
      disabled: [false, false, true, false, false, false],
    })).toEqual({
      activeIndex: 4,
      selected: [1, 3, 4],
    });
  });

  it('reports selection membership', () => {
    const state = { activeIndex: 1, selected: [1, 3] } as const;
    expect(isSelected(state, 3)).toBe(true);
    expect(isSelected(state, 2)).toBe(false);
  });

  it('rejects invalid state and invalid single-selection cardinality', () => {
    expect(() => normalizeSelection(3, 3, [], 'multiple')).toThrow(RangeError);
    expect(() => normalizeSelection(3, 1, [0, 2], 'single')).toThrow(RangeError);
  });
});
