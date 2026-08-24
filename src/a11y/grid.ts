import type { Direction } from '../rtl/direction';

export type GridNavigationOptions = {
  direction?: Direction;
  wrapRows?: boolean;
  pageRows?: number;
  ctrlKey?: boolean;
};

export type GridPosition = {
  row: number;
  column: number;
};

function assertGrid(rowCount: number, columnCount: number): void {
  if (!Number.isInteger(rowCount) || rowCount <= 0) throw new RangeError('rowCount must be a positive integer.');
  if (!Number.isInteger(columnCount) || columnCount <= 0) throw new RangeError('columnCount must be a positive integer.');
}

function assertIndex(index: number, itemCount: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= itemCount) {
    throw new RangeError(`currentIndex must be an integer between 0 and ${itemCount - 1}.`);
  }
}

export function gridPosition(index: number, rowCount: number, columnCount: number): GridPosition {
  assertGrid(rowCount, columnCount);
  const itemCount = rowCount * columnCount;
  assertIndex(index, itemCount);
  return { row: Math.floor(index / columnCount), column: index % columnCount };
}

export function gridIndex(position: GridPosition, rowCount: number, columnCount: number): number {
  assertGrid(rowCount, columnCount);
  if (!Number.isInteger(position.row) || position.row < 0 || position.row >= rowCount) {
    throw new RangeError(`row must be an integer between 0 and ${rowCount - 1}.`);
  }
  if (!Number.isInteger(position.column) || position.column < 0 || position.column >= columnCount) {
    throw new RangeError(`column must be an integer between 0 and ${columnCount - 1}.`);
  }
  return position.row * columnCount + position.column;
}

/**
 * Resolve focus movement in a rectangular grid whose index order follows DOM/
 * logical inline order. Horizontal physical-arrow behavior is direction-aware:
 * in RTL, ArrowRight moves toward the previous logical column and ArrowLeft
 * toward the next logical column.
 */
export function nextGridIndex(
  currentIndex: number,
  rowCount: number,
  columnCount: number,
  key: string,
  options: GridNavigationOptions = {},
): number {
  assertGrid(rowCount, columnCount);
  const itemCount = rowCount * columnCount;
  assertIndex(currentIndex, itemCount);

  const { row, column } = gridPosition(currentIndex, rowCount, columnCount);
  const direction = options.direction ?? 'ltr';
  const wrapRows = options.wrapRows ?? false;
  const pageRows = options.pageRows ?? 1;
  if (!Number.isInteger(pageRows) || pageRows <= 0) throw new RangeError('pageRows must be a positive integer.');

  if (key === 'Home') return options.ctrlKey ? 0 : gridIndex({ row, column: 0 }, rowCount, columnCount);
  if (key === 'End') return options.ctrlKey ? itemCount - 1 : gridIndex({ row, column: columnCount - 1 }, rowCount, columnCount);

  if (key === 'ArrowUp') {
    return row === 0 ? currentIndex : gridIndex({ row: row - 1, column }, rowCount, columnCount);
  }
  if (key === 'ArrowDown') {
    return row === rowCount - 1 ? currentIndex : gridIndex({ row: row + 1, column }, rowCount, columnCount);
  }
  if (key === 'PageUp') {
    return gridIndex({ row: Math.max(0, row - pageRows), column }, rowCount, columnCount);
  }
  if (key === 'PageDown') {
    return gridIndex({ row: Math.min(rowCount - 1, row + pageRows), column }, rowCount, columnCount);
  }

  const previousPhysical = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  const nextPhysical = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';

  if (key === previousPhysical) {
    if (column > 0) return currentIndex - 1;
    if (wrapRows && row > 0) return gridIndex({ row: row - 1, column: columnCount - 1 }, rowCount, columnCount);
    return currentIndex;
  }

  if (key === nextPhysical) {
    if (column < columnCount - 1) return currentIndex + 1;
    if (wrapRows && row < rowCount - 1) return gridIndex({ row: row + 1, column: 0 }, rowCount, columnCount);
    return currentIndex;
  }

  return currentIndex;
}
