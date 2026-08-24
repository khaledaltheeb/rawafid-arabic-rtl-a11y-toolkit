import type { Direction } from './direction';
import { getTextDirection } from './direction';

export const BIDI = {
  ALM: '\u061C',
  LRM: '\u200E',
  RLM: '\u200F',
  LRE: '\u202A',
  RLE: '\u202B',
  PDF: '\u202C',
  LRO: '\u202D',
  RLO: '\u202E',
  LRI: '\u2066',
  RLI: '\u2067',
  FSI: '\u2068',
  PDI: '\u2069',
} as const;

const ANY_BIDI_CONTROL = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
const ALL_BIDI_CONTROLS = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/gu;
const OVERRIDE_AND_EMBED_CONTROLS = /[\u202A-\u202E]/gu;
const UNSAFE_OVERRIDE_OR_EMBED = /[\u202A-\u202E]/u;

export function containsBidiControls(text: string): boolean {
  return ANY_BIDI_CONTROL.test(text);
}

/** Legacy embedding/override controls can make untrusted text visually deceptive. */
export function hasUnsafeBidiOverrides(text: string): boolean {
  return UNSAFE_OVERRIDE_OR_EMBED.test(text);
}

/** Remove every explicit bidi control, including isolates and directional marks. */
export function stripBidiControls(text: string): string {
  return text.replace(ALL_BIDI_CONTROLS, '');
}

/**
 * Remove only legacy embedding/override controls. Isolation controls and
 * directional marks are retained because they can be legitimate presentation
 * metadata. This is a text-display helper, not a source-code security scanner.
 */
export function stripUnsafeBidiOverrides(text: string): string {
  return text.replace(OVERRIDE_AND_EMBED_CONTROLS, '');
}

export function bidiIsolate(text: string, direction: Direction | 'auto' = 'auto'): string {
  const dir = direction === 'auto' ? getTextDirection(text) : direction;
  const opener = dir === 'rtl' ? BIDI.RLI : BIDI.LRI;
  return `${opener}${text}${BIDI.PDI}`;
}

export function autoBidiIsolate(text: string): string {
  return `${BIDI.FSI}${text}${BIDI.PDI}`;
}
