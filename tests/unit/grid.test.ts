import { describe, expect, it } from 'vitest';
import { gridIndex, gridPosition, nextGridIndex } from '../../src/a11y/grid';

describe('direction-aware rectangular grid navigation', () => {
  it('converts between flat indices and row/column positions', () => {
    expect(gridPosition(5, 3, 4)).toEqual({ row: 1, column: 1 });
    expect(gridIndex({ row: 1, column: 1 }, 3, 4)).toBe(5);
  });

  it('moves vertically without changing the logical column', () => {
    expect(nextGridIndex(5, 3, 4, 'ArrowUp')).toBe(1);
    expect(nextGridIndex(5, 3, 4, 'ArrowDown')).toBe(9);
    expect(nextGridIndex(1, 3, 4, 'ArrowUp')).toBe(1);
  });

  it('maps physical horizontal arrows through writing direction', () => {
    expect(nextGridIndex(5, 3, 4, 'ArrowRight', { direction: 'ltr' })).toBe(6);
    expect(nextGridIndex(5, 3, 4, 'ArrowLeft', { direction: 'ltr' })).toBe(4);
    expect(nextGridIndex(5, 3, 4, 'ArrowRight', { direction: 'rtl' })).toBe(4);
    expect(nextGridIndex(5, 3, 4, 'ArrowLeft', { direction: 'rtl' })).toBe(6);
  });

  it('does not wrap data-grid rows by default', () => {
    expect(nextGridIndex(3, 3, 4, 'ArrowRight', { direction: 'ltr' })).toBe(3);
    expect(nextGridIndex(4, 3, 4, 'ArrowLeft', { direction: 'ltr' })).toBe(4);
  });

  it('can opt into layout-grid row wrapping', () => {
    expect(nextGridIndex(3, 3, 4, 'ArrowRight', { direction: 'ltr', wrapRows: true })).toBe(4);
    expect(nextGridIndex(4, 3, 4, 'ArrowLeft', { direction: 'ltr', wrapRows: true })).toBe(3);
    expect(nextGridIndex(4, 3, 4, 'ArrowRight', { direction: 'rtl', wrapRows: true })).toBe(3);
  });

  it('supports row Home/End and grid Control+Home/End', () => {
    expect(nextGridIndex(6, 3, 4, 'Home')).toBe(4);
    expect(nextGridIndex(6, 3, 4, 'End')).toBe(7);
    expect(nextGridIndex(6, 3, 4, 'Home', { ctrlKey: true })).toBe(0);
    expect(nextGridIndex(6, 3, 4, 'End', { ctrlKey: true })).toBe(11);
  });

  it('supports author-defined page movement', () => {
    expect(nextGridIndex(13, 5, 4, 'PageUp', { pageRows: 2 })).toBe(5);
    expect(nextGridIndex(5, 5, 4, 'PageDown', { pageRows: 3 })).toBe(17);
    expect(nextGridIndex(17, 5, 4, 'PageDown', { pageRows: 3 })).toBe(17);
  });

  it('rejects invalid grid dimensions, indices, coordinates, and page size', () => {
    expect(() => nextGridIndex(0, 0, 4, 'ArrowRight')).toThrow(RangeError);
    expect(() => nextGridIndex(12, 3, 4, 'ArrowRight')).toThrow(RangeError);
    expect(() => gridIndex({ row: 3, column: 0 }, 3, 4)).toThrow(RangeError);
    expect(() => nextGridIndex(0, 3, 4, 'PageDown', { pageRows: 0 })).toThrow(RangeError);
  });
});
