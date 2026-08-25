import { describe, expect, it } from 'vitest';
import {
  getLocaleNumberSymbols,
  parseLocalizedDecimal,
} from '../../src/i18n/number-input';

interface MatrixCase {
  locale: string;
  numberingSystem?: string;
}

const MATRIX: readonly MatrixCase[] = [
  { locale: 'ar-JO', numberingSystem: 'arab' },
  { locale: 'fa-IR', numberingSystem: 'arabext' },
  { locale: 'en-US', numberingSystem: 'latn' },
  { locale: 'en-IN', numberingSystem: 'latn' },
  { locale: 'fr-FR', numberingSystem: 'latn' },
  { locale: 'de-DE', numberingSystem: 'latn' },
  { locale: 'hi-IN', numberingSystem: 'latn' },
  { locale: 'bn-BD', numberingSystem: 'beng' },
];

const VALUES = [-1234567.5, -1000.25, -0.5, 0, 0.5, 12.75, 1000.25, 1234567.5] as const;

function fixedFormatter({ locale, numberingSystem }: MatrixCase): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    ...(numberingSystem === undefined ? {} : { numberingSystem }),
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

describe('localized decimal global roundtrip matrix', () => {
  for (const matrixCase of MATRIX) {
    it(`round-trips formatter output for ${matrixCase.locale}/${matrixCase.numberingSystem ?? 'default'}`, () => {
      const formatter = fixedFormatter(matrixCase);
      const resolved = formatter.resolvedOptions();
      const symbols = getLocaleNumberSymbols(matrixCase.locale, {
        ...(matrixCase.numberingSystem === undefined ? {} : { numberingSystem: matrixCase.numberingSystem }),
      });

      expect(symbols.locale).toBe(resolved.locale);
      expect(symbols.numberingSystem).toBe(resolved.numberingSystem);
      expect(new Set(symbols.digits).size).toBe(10);

      for (const value of VALUES) {
        const formatted = formatter.format(value);
        const parsed = parseLocalizedDecimal(formatted, matrixCase.locale, {
          ...(matrixCase.numberingSystem === undefined ? {} : { numberingSystem: matrixCase.numberingSystem }),
          digitAcceptance: 'locale',
        });

        expect(parsed, `${matrixCase.locale}: ${formatted}`).toMatchObject({ ok: true });
        if (parsed.ok) {
          expect(parsed.value).toBe(value);
          expect(parsed.numberingSystem).toBe(resolved.numberingSystem);
        }
      }
    });
  }

  it('accepts locale grouping tokens including non-ASCII space-like separators only when structurally valid', () => {
    const formatter = fixedFormatter({ locale: 'fr-FR', numberingSystem: 'latn' });
    const formatted = formatter.format(1234567.5);
    const group = formatter.formatToParts(1234567.5).find((part) => part.type === 'group')?.value;
    expect(group).toBeDefined();

    const valid = parseLocalizedDecimal(formatted, 'fr-FR', { digitAcceptance: 'locale' });
    expect(valid).toMatchObject({ ok: true, value: 1234567.5 });

    if (group !== undefined) {
      const malformed = `12${group}34${group}567,50`;
      expect(parseLocalizedDecimal(malformed, 'fr-FR', { digitAcceptance: 'locale' })).toMatchObject({
        ok: false,
        reason: 'invalid-grouping',
      });
    }
  });

  it('does not accept a locale decimal separator from another locale by accident', () => {
    expect(parseLocalizedDecimal('1.234,50', 'en-US')).toMatchObject({
      ok: false,
      reason: 'group-in-fraction',
    });
    expect(parseLocalizedDecimal('1,234.50', 'de-DE')).toMatchObject({
      ok: false,
      reason: 'group-in-fraction',
    });
  });

  it('preserves negative zero semantics when the lexical input is negative zero', () => {
    const parsed = parseLocalizedDecimal('-0.00', 'en-US');
    expect(parsed).toMatchObject({ ok: true, normalized: '-0.00' });
    if (parsed.ok) expect(Object.is(parsed.value, -0)).toBe(true);
  });
});
