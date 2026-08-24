import type { Direction } from './direction';

export type InlineSide = 'start' | 'end';
export type PhysicalInlineSide = 'left' | 'right';

export function inlineSideToPhysical(side: InlineSide, direction: Direction): PhysicalInlineSide {
  if (direction === 'rtl') return side === 'start' ? 'right' : 'left';
  return side === 'start' ? 'left' : 'right';
}

export function physicalSideToInline(side: PhysicalInlineSide, direction: Direction): InlineSide {
  if (direction === 'rtl') return side === 'right' ? 'start' : 'end';
  return side === 'left' ? 'start' : 'end';
}
