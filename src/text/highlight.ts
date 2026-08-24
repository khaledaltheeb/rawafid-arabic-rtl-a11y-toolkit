export type HighlightSegment = {
  text: string;
  match: boolean;
};

type Grapheme = { index: number; segment: string };

function graphemes(value: string, locale: string): Grapheme[] {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
  return [...segmenter.segment(value)].map((entry) => ({ index: entry.index, segment: entry.segment }));
}

/**
 * Split a short UI string into matched/unmatched text without producing HTML.
 * Matching is locale-aware and keeps original UTF-16 boundaries intact even
 * when locale case folding changes string length (for example ß vs SS).
 */
export function segmentHighlights(text: string, query: string, locale = 'ar'): HighlightSegment[] {
  const needle = query.trim();
  if (!needle || !text) return [{ text, match: false }];

  const source = graphemes(text, locale);
  const queryLength = graphemes(needle, locale).length;
  const collator = new Intl.Collator(locale, { usage: 'search', sensitivity: 'base' });
  const output: HighlightSegment[] = [];
  let searchStart = 0;
  let emittedOffset = 0;

  while (searchStart < source.length) {
    let match: { start: number; end: number; nextIndex: number } | undefined;

    for (let start = searchStart; start < source.length && !match; start += 1) {
      const minLength = Math.max(1, queryLength - 2);
      const maxLength = Math.min(source.length - start, Math.max(queryLength + 4, queryLength * 2));
      for (let length = minLength; length <= maxLength; length += 1) {
        const first = source[start];
        const after = source[start + length];
        if (!first) continue;
        const end = after?.index ?? text.length;
        const candidate = text.slice(first.index, end);
        if (collator.compare(candidate, needle) === 0) {
          match = { start: first.index, end, nextIndex: start + length };
          break;
        }
      }
    }

    if (!match) break;
    if (match.start > emittedOffset) output.push({ text: text.slice(emittedOffset, match.start), match: false });
    output.push({ text: text.slice(match.start, match.end), match: true });
    emittedOffset = match.end;
    searchStart = match.nextIndex;
  }

  if (emittedOffset < text.length) output.push({ text: text.slice(emittedOffset), match: false });
  return output.length > 0 ? output : [{ text, match: false }];
}
