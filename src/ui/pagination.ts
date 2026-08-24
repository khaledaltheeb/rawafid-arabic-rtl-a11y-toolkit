export type PaginationItem = number | 'gap';

export type PaginationModel = {
  currentPage: number;
  totalPages: number;
  previousPage: number | null;
  nextPage: number | null;
  items: PaginationItem[];
};

export function getPaginationModel(currentPage: number, totalPages: number, radius = 2): PaginationModel {
  if (!Number.isInteger(totalPages) || totalPages < 1) throw new RangeError('totalPages must be a positive integer.');
  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages) {
    throw new RangeError('currentPage must be within totalPages.');
  }
  if (!Number.isInteger(radius) || radius < 0) throw new RangeError('radius must be a non-negative integer.');

  const visible = new Set<number>([1, totalPages, currentPage]);
  for (let offset = -radius; offset <= radius; offset += 1) {
    const page = currentPage + offset;
    if (page >= 1 && page <= totalPages) visible.add(page);
  }

  const pages = [...visible].sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    if (page === undefined) continue;
    const previous = pages[index - 1];
    if (previous !== undefined && page - previous > 1) items.push('gap');
    items.push(page);
  }

  return {
    currentPage,
    totalPages,
    previousPage: currentPage > 1 ? currentPage - 1 : null,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    items,
  };
}
