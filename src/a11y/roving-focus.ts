import type { Direction } from '../rtl/direction';
import { nextIndexFromKey, type Orientation } from './keyboard';

export type RovingFocusOptions = {
  direction?: Direction;
  orientation?: Orientation;
  loop?: boolean;
  disabled?: readonly boolean[];
};

function isEnabled(index: number, itemCount: number, disabled: readonly boolean[]): boolean {
  return index >= 0 && index < itemCount && disabled[index] !== true;
}

export function firstEnabledIndex(itemCount: number, disabled: readonly boolean[] = []): number {
  if (!Number.isInteger(itemCount) || itemCount <= 0) return -1;
  for (let index = 0; index < itemCount; index += 1) {
    if (isEnabled(index, itemCount, disabled)) return index;
  }
  return -1;
}

export function lastEnabledIndex(itemCount: number, disabled: readonly boolean[] = []): number {
  if (!Number.isInteger(itemCount) || itemCount <= 0) return -1;
  for (let index = itemCount - 1; index >= 0; index -= 1) {
    if (isEnabled(index, itemCount, disabled)) return index;
  }
  return -1;
}

function nextEnabledFrom(startIndex: number, itemCount: number, disabled: readonly boolean[]): number {
  for (let offset = 1; offset <= itemCount; offset += 1) {
    const candidate = (startIndex + offset) % itemCount;
    if (isEnabled(candidate, itemCount, disabled)) return candidate;
  }
  return -1;
}

/**
 * Resolve keyboard movement for composite widgets while skipping disabled
 * items. The caller remains responsible for DOM focus and ARIA semantics.
 */
export function nextRovingFocusIndex(
  currentIndex: number,
  itemCount: number,
  key: string,
  options: RovingFocusOptions = {},
): number {
  if (!Number.isInteger(itemCount) || itemCount <= 0) return -1;
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= itemCount) {
    throw new RangeError(`currentIndex must be an integer between 0 and ${itemCount - 1}.`);
  }

  const disabled = options.disabled ?? [];
  if (disabled[currentIndex] === true) {
    const replacement = nextEnabledFrom(currentIndex, itemCount, disabled);
    return replacement;
  }
  if (key === 'Home') return firstEnabledIndex(itemCount, disabled);
  if (key === 'End') return lastEnabledIndex(itemCount, disabled);

  const baseOptions = {
    ...(options.direction ? { direction: options.direction } : {}),
    ...(options.orientation ? { orientation: options.orientation } : {}),
    ...(options.loop !== undefined ? { loop: options.loop } : {}),
  };
  const initial = nextIndexFromKey(currentIndex, itemCount, key, baseOptions);
  if (initial === currentIndex || initial < 0) return initial;
  if (isEnabled(initial, itemCount, disabled)) return initial;

  const loop = options.loop ?? true;
  let candidate = initial;
  for (let attempts = 0; attempts < itemCount - 1; attempts += 1) {
    const next = nextIndexFromKey(candidate, itemCount, key, baseOptions);
    if (next === candidate) return currentIndex;
    candidate = next;
    if (isEnabled(candidate, itemCount, disabled)) return candidate;
    if (!loop && (candidate === 0 || candidate === itemCount - 1)) break;
  }
  return currentIndex;
}

/** Generate the tabIndex model for a roving-tabindex composite. */
export function rovingTabIndexes(
  activeIndex: number,
  itemCount: number,
  disabled: readonly boolean[] = [],
): number[] {
  if (!Number.isInteger(itemCount) || itemCount < 0) throw new RangeError('itemCount must be a non-negative integer.');
  if (itemCount === 0) return [];
  if (!Number.isInteger(activeIndex) || activeIndex < 0 || activeIndex >= itemCount) {
    throw new RangeError(`activeIndex must be an integer between 0 and ${itemCount - 1}.`);
  }
  const fallback = disabled[activeIndex] === true
    ? nextEnabledFrom(activeIndex, itemCount, disabled)
    : activeIndex;
  return Array.from({ length: itemCount }, (_, index) => (index === fallback ? 0 : -1));
}
