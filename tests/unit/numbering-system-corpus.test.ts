import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { getLocaleNumberSymbols, parseLocalizedDecimal } from '../../src/i18n/number-input';

type DigitAcceptance = 'locale' | 'locale-and-latn' | 'arabic-flex';

type CorpusCase = {
  id: string;
  locale: string;
  expectedNumberingSystem: string;
  digitAcceptance: DigitAcceptance;
};

type Corpus = {
  schemaVersion: number;
  title: string;
  scope: string;
  value: number;
  cases: CorpusCase[];
};

const corpus = JSON.parse(
  await readFile(new URL('../fixtures/numbering-system-interoperability-corpus.json', import.meta.url), 'utf8'),
) as Corpus;

describe('numbering-system interoperability corpus', () => {
  it('is versioned, explicit, and duplicate-free', () => {
    expect(corpus.schemaVersion).toBe(1);
    expect(corpus.title).toContain('numbering-system interoperability');
    expect(corpus.scope).toContain('explicit');
    expect(corpus.cases.length).toBeGreaterThanOrEqual(6);
    expect(new Set(corpus.cases.map((entry) => entry.id)).size).toBe(corpus.cases.length);
  });

  for (const entry of corpus.cases) {
    it(`${entry.id}: locale extension, formatter, symbol extraction, and parser agree`, () => {
      const locale = new Intl.Locale(entry.locale);
      expect(locale.numberingSystem).toBe(entry.expectedNumberingSystem);

      const formatter = new Intl.NumberFormat(entry.locale, {
        useGrouping: true,
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      expect(formatter.resolvedOptions().numberingSystem).toBe(entry.expectedNumberingSystem);

      const symbols = getLocaleNumberSymbols(entry.locale);
      expect(symbols.numberingSystem).toBe(entry.expectedNumberingSystem);
      expect(new Set(symbols.digits).size).toBe(10);
      expect(symbols.decimal.length).toBeGreaterThan(0);

      const formatted = formatter.format(corpus.value);
      const parsed = parseLocalizedDecimal(formatted, entry.locale, {
        allowGrouping: true,
        digitAcceptance: entry.digitAcceptance,
      });

      expect(parsed).toMatchObject({
        ok: true,
        value: corpus.value,
        numberingSystem: entry.expectedNumberingSystem,
      });
    });
  }
});
