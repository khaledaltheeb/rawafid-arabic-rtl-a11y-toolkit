import type { Direction } from '../rtl/direction';

export type Orientation = 'horizontal' | 'vertical';

export type NavigationOptions = {
  direction?: Direction;
  orientation?: Orientation;
  loop?: boolean;
};

export function isActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ' || key === 'Spacebar';
}

export function nextIndexFromKey(
  currentIndex: number,
  itemCount: number,
  key: string,
  options: NavigationOptions = {},
): number {
  if (!Number.isInteger(itemCount) || itemCount <= 0) return -1;
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= itemCount) {
    throw new RangeError(`currentIndex must be an integer between 0 and ${itemCount - 1}.`);
  }

  const { direction = 'ltr', orientation = 'horizontal', loop = true } = options;
  if (key === 'Home') return 0;
  if (key === 'End') return itemCount - 1;

  let delta = 0;
  if (orientation === 'vertical') {
    if (key === 'ArrowDown') delta = 1;
    if (key === 'ArrowUp') delta = -1;
  } else {
    if (key === 'ArrowRight') delta = direction === 'rtl' ? -1 : 1;
    if (key === 'ArrowLeft') delta = direction === 'rtl' ? 1 : -1;
  }

  if (delta === 0) return currentIndex;
  const next = currentIndex + delta;
  if (loop) return (next + itemCount) % itemCount;
  return Math.max(0, Math.min(itemCount - 1, next));
}
