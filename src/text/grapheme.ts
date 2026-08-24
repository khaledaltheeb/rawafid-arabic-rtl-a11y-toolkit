export type GraphemeSegment = {
  segment: string;
  index: number;
  end: number;
};

function createGraphemeSegmenter(locale: string): Intl.Segmenter {
  return new Intl.Segmenter(locale, { granularity: 'grapheme' });
}

/** Segment text by user-perceived grapheme clusters rather than UTF-16 code units. */
export function segmentGraphemes(value: string, locale = 'und'): GraphemeSegment[] {
  const entries = [...createGraphemeSegmenter(locale).segment(value)];
  return entries.map((entry, index) => ({
    segment: entry.segment,
    index: entry.index,
    end: entries[index + 1]?.index ?? value.length,
  }));
}

export function graphemeLength(value: string, locale = 'und'): number {
  return [...createGraphemeSegmenter(locale).segment(value)].length;
}

/** Array.slice-style slicing at grapheme boundaries. */
export function sliceGraphemes(value: string, start = 0, end?: number, locale = 'und'): string {
  const segments = segmentGraphemes(value, locale).map((entry) => entry.segment);
  return segments.slice(start, end).join('');
}

export type TruncateGraphemesOptions = {
  locale?: string;
  ellipsis?: string;
};

/** Truncate without splitting extended grapheme clusters. */
export function truncateGraphemes(
  value: string,
  maxLength: number,
  options: TruncateGraphemesOptions = {},
): string {
  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new RangeError('maxLength must be a non-negative integer.');
  }

  const { locale = 'und', ellipsis = '…' } = options;
  const sourceLength = graphemeLength(value, locale);
  if (sourceLength <= maxLength) return value;
  if (maxLength === 0) return '';

  const ellipsisLength = graphemeLength(ellipsis, locale);
  if (ellipsisLength >= maxLength) return sliceGraphemes(ellipsis, 0, maxLength, locale);

  return `${sliceGraphemes(value, 0, maxLength - ellipsisLength, locale)}${ellipsis}`;
}
