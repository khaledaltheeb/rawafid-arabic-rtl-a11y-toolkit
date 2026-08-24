import { describe, expect, it } from 'vitest';
import { nextIndexFromKey } from '../../src/a11y/keyboard';
import { getPaginationModel } from '../../src/ui/pagination';
import { segmentHighlights } from '../../src/text/highlight';
import { inlineSideToPhysical } from '../../src/rtl/logical';

describe('general UI utilities', () => {
  it('makes horizontal keyboard navigation direction-aware', () => {
    expect(nextIndexFromKey(1, 4, 'ArrowRight', { direction: 'ltr' })).toBe(2);
    expect(nextIndexFromKey(1, 4, 'ArrowRight', { direction: 'rtl' })).toBe(0);
    expect(nextIndexFromKey(0, 4, 'ArrowLeft', { direction: 'ltr' })).toBe(3);
  });

  it('rejects impossible keyboard navigation state', () => {
    expect(() => nextIndexFromKey(4, 4, 'ArrowRight')).toThrow(RangeError);
    expect(nextIndexFromKey(0, 0, 'ArrowRight')).toBe(-1);
  });

  it('maps logical sides correctly', () => {
    expect(inlineSideToPhysical('start', 'rtl')).toBe('right');
    expect(inlineSideToPhysical('end', 'ltr')).toBe('right');
  });

  it('builds accessible pagination data without presentation assumptions', () => {
    expect(getPaginationModel(5, 12, 1)).toEqual({
      currentPage: 5,
      totalPages: 12,
      previousPage: 4,
      nextPage: 6,
      items: [1, 'gap', 4, 5, 6, 'gap', 12],
    });
  });

  it('returns highlight segments instead of unsafe HTML', () => {
    expect(segmentHighlights('اختبار عربي اختبار', 'اختبار')).toEqual([
      { text: 'اختبار', match: true },
      { text: ' عربي ', match: false },
      { text: 'اختبار', match: true },
    ]);
  });

  it('preserves source boundaries when locale matching changes length', () => {
    expect(segmentHighlights('Straße Berlin', 'STRASSE', 'de')).toEqual([
      { text: 'Straße', match: true },
      { text: ' Berlin', match: false },
    ]);
  });
});
