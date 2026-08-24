import { describe, expect, it } from 'vitest';
import { findTypeaheadMatch, updateTypeaheadBuffer } from '../../src/a11y/typeahead';

describe('locale-aware typeahead', () => {
  it('matches Arabic labels and skips disabled items', () => {
    const items = [
      { label: 'العربية' },
      { label: 'العراق', disabled: true },
      { label: 'الفرنسية' },
      { label: 'الفارسية' },
    ];
    expect(findTypeaheadMatch(items, 'ال', { locale: 'ar', startIndex: 0 })).toBe(2);
    expect(findTypeaheadMatch(items, 'الفا', { locale: 'ar', startIndex: 2 })).toBe(3);
  });

  it('uses locale search collation rather than ASCII case folding', () => {
    const items = [{ label: 'École' }, { label: 'Österreich' }, { label: 'Straße' }];
    expect(findTypeaheadMatch(items, 'e', { locale: 'fr' })).toBe(0);
    expect(findTypeaheadMatch(items, 'o', { locale: 'de' })).toBe(1);
  });

  it('wraps by default and can be constrained to the remaining range', () => {
    const items = [{ label: 'Alpha' }, { label: 'Beta' }, { label: 'Gamma' }];
    expect(findTypeaheadMatch(items, 'a', { locale: 'en', startIndex: 2 })).toBe(0);
    expect(findTypeaheadMatch(items, 'a', { locale: 'en', startIndex: 2, wrap: false })).toBe(-1);
  });

  it('rejects impossible starting indices', () => {
    expect(() => findTypeaheadMatch([{ label: 'Alpha' }], 'a', { startIndex: 1 })).toThrow(RangeError);
  });

  it('builds and expires an explicit multi-character buffer', () => {
    const first = updateTypeaheadBuffer(undefined, 'a', 1000, 500);
    const second = updateTypeaheadBuffer(first, 'r', 1300, 500);
    const reset = updateTypeaheadBuffer(second, 'b', 2000, 500);
    expect(first.value).toBe('a');
    expect(second.value).toBe('ar');
    expect(reset.value).toBe('b');
  });

  it('rejects invalid timing input', () => {
    expect(() => updateTypeaheadBuffer(undefined, 'a', Number.NaN)).toThrow(RangeError);
    expect(() => updateTypeaheadBuffer(undefined, 'a', 0, -1)).toThrow(RangeError);
  });
});
