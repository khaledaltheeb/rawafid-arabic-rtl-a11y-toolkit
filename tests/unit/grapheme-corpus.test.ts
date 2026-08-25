import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { graphemeLength, segmentGraphemes, sliceGraphemes, truncateGraphemes } from '../../src/text/grapheme';

type CorpusCase = {
  id: string;
  locale: string;
  value: string;
  expectedSegments: string[];
};

type Corpus = {
  schemaVersion: number;
  title: string;
  scope: string;
  cases: CorpusCase[];
};

const corpus = JSON.parse(
  await readFile(new URL('../fixtures/grapheme-interoperability-corpus.json', import.meta.url), 'utf8'),
) as Corpus;

describe('grapheme interoperability corpus', () => {
  it('is versioned, independently scoped, and duplicate-free', () => {
    expect(corpus.schemaVersion).toBe(1);
    expect(corpus.title).toContain('grapheme interoperability');
    expect(corpus.scope).toContain('does not claim');
    expect(corpus.cases.length).toBeGreaterThanOrEqual(8);
    expect(new Set(corpus.cases.map((entry) => entry.id)).size).toBe(corpus.cases.length);
  });

  for (const entry of corpus.cases) {
    it(`${entry.id}: segment, length, slice, and truncation preserve reviewed clusters`, () => {
      const segments = segmentGraphemes(entry.value, entry.locale).map((part) => part.segment);
      expect(segments).toEqual(entry.expectedSegments);
      expect(graphemeLength(entry.value, entry.locale)).toBe(entry.expectedSegments.length);

      entry.expectedSegments.forEach((segment, index) => {
        expect(sliceGraphemes(entry.value, index, index + 1, entry.locale)).toBe(segment);
      });

      const first = entry.expectedSegments[0] ?? '';
      if (entry.expectedSegments.length > 1) {
        expect(truncateGraphemes(entry.value, 1, { locale: entry.locale, ellipsis: '' })).toBe(first);
      } else {
        expect(truncateGraphemes(entry.value, 1, { locale: entry.locale, ellipsis: '' })).toBe(entry.value);
      }
    });
  }
});
