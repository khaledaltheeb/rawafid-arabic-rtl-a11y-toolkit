export type WordSegment = {
  segment: string;
  index: number;
  end: number;
  isWordLike: boolean;
};

export type SentenceSegment = {
  segment: string;
  index: number;
  end: number;
};

/** Segment text at locale-sensitive word boundaries using the host Intl implementation. */
export function segmentWords(value: string, locale = 'und'): WordSegment[] {
  const entries = [...new Intl.Segmenter(locale, { granularity: 'word' }).segment(value)];
  return entries.map((entry, index) => ({
    segment: entry.segment,
    index: entry.index,
    end: entries[index + 1]?.index ?? value.length,
    isWordLike: entry.isWordLike === true,
  }));
}

/** Return only word-like segments, excluding punctuation and whitespace boundaries. */
export function words(value: string, locale = 'und'): string[] {
  return segmentWords(value, locale)
    .filter((entry) => entry.isWordLike)
    .map((entry) => entry.segment);
}

/** Segment text at locale-sensitive sentence boundaries using the host Intl implementation. */
export function segmentSentences(value: string, locale = 'und'): SentenceSegment[] {
  const entries = [...new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(value)];
  return entries.map((entry, index) => ({
    segment: entry.segment,
    index: entry.index,
    end: entries[index + 1]?.index ?? value.length,
  }));
}
