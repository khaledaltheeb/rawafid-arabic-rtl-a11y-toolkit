import { describe, expect, it } from 'vitest';
import { getPaginationModel } from '../../src/ui/pagination';

describe('pagination invariants', () => {
  it('preserves ordering, uniqueness, boundaries, and gap meaning across a broad deterministic matrix', () => {
    for (let totalPages = 1; totalPages <= 40; totalPages += 1) {
      for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
        for (let radius = 0; radius <= 5; radius += 1) {
          const model = getPaginationModel(currentPage, totalPages, radius);
          const numericItems = model.items.filter((item): item is number => item !== 'gap');

          expect(model.currentPage).toBe(currentPage);
          expect(model.totalPages).toBe(totalPages);
          expect(model.previousPage).toBe(currentPage === 1 ? null : currentPage - 1);
          expect(model.nextPage).toBe(currentPage === totalPages ? null : currentPage + 1);

          expect(numericItems[0]).toBe(1);
          expect(numericItems.at(-1)).toBe(totalPages);
          expect(numericItems).toContain(currentPage);
          expect(new Set(numericItems).size).toBe(numericItems.length);
          expect([...numericItems].sort((a, b) => a - b)).toEqual(numericItems);
          expect(numericItems.every((page) => page >= 1 && page <= totalPages)).toBe(true);

          expect(model.items[0]).not.toBe('gap');
          expect(model.items.at(-1)).not.toBe('gap');

          for (let index = 0; index < model.items.length; index += 1) {
            const item = model.items[index];
            if (item !== 'gap') continue;

            const before = model.items[index - 1];
            const after = model.items[index + 1];
            expect(typeof before).toBe('number');
            expect(typeof after).toBe('number');
            if (typeof before === 'number' && typeof after === 'number') {
              expect(after - before).toBeGreaterThan(1);
            }
          }

          for (let index = 1; index < numericItems.length; index += 1) {
            const previous = numericItems[index - 1];
            const current = numericItems[index];
            if (previous === undefined || current === undefined) continue;

            const previousPosition = model.items.indexOf(previous);
            const currentPosition = model.items.indexOf(current);
            const between = model.items.slice(previousPosition + 1, currentPosition);
            expect(between).toEqual(current - previous > 1 ? ['gap'] : []);
          }
        }
      }
    }
  });

  it('includes every page when the radius covers the whole range', () => {
    for (let totalPages = 1; totalPages <= 30; totalPages += 1) {
      for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
        const model = getPaginationModel(currentPage, totalPages, totalPages);
        expect(model.items).toEqual(Array.from({ length: totalPages }, (_, index) => index + 1));
      }
    }
  });

  it('rejects invalid integer domains consistently', () => {
    const invalidCases: Array<[number, number, number]> = [
      [0, 1, 0],
      [2, 1, 0],
      [1, 0, 0],
      [1, 1, -1],
      [1.5, 2, 1],
      [1, 2.5, 1],
      [1, 2, 0.5],
      [Number.NaN, 2, 1],
      [1, Number.POSITIVE_INFINITY, 1],
    ];

    for (const [currentPage, totalPages, radius] of invalidCases) {
      expect(() => getPaginationModel(currentPage, totalPages, radius)).toThrow(RangeError);
    }
  });
});
