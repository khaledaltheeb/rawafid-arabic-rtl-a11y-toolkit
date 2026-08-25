import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { diagnoseUnicodeDisplay } from '../../src/text/unicode-security';

type CorpusCase = {
  id: string;
  value: string;
  expectedRisks: string[];
  expectedScripts: string[];
  interpretation: string;
};

type Corpus = {
  schemaVersion: number;
  title: string;
  scope: string;
  cases: CorpusCase[];
};

const corpus = JSON.parse(
  await readFile(new URL('../fixtures/unicode-display-risk-corpus.json', import.meta.url), 'utf8'),
) as Corpus;

describe('Unicode display-risk regression corpus', () => {
  it('has a versioned non-conformance scope and unique cases', () => {
    expect(corpus.schemaVersion).toBe(1);
    expect(corpus.title).toContain('Unicode display-risk');
    expect(corpus.scope).toContain('does not claim');
    expect(corpus.cases.length).toBeGreaterThanOrEqual(10);
    expect(new Set(corpus.cases.map((entry) => entry.id)).size).toBe(corpus.cases.length);
  });

  for (const entry of corpus.cases) {
    it(`${entry.id}: matches the reviewed diagnostic contract`, () => {
      const diagnostic = diagnoseUnicodeDisplay(entry.value);
      expect(diagnostic.risks).toEqual(entry.expectedRisks);
      expect(diagnostic.scripts).toEqual(entry.expectedScripts);
      expect(entry.interpretation.length).toBeGreaterThan(0);
    });
  }
});
