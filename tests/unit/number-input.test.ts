import { describe, expect, it } from 'vitest';
import {
  getLocaleNumberSymbols,
  parseLocalizedDecimal,
} from '../../src/i18n/number-input';

describe('localized decimal input', () => {
  it('derives Arabic decimal symbols from Intl.NumberFormat', () => {
    const symbols = getLocaleNumberSymbols('ar-JO', { numberingSystem: 'arab' });
    expect(symbols.numberingSystem).toBe('arab');
    expect(symbols.digits).toEqual([...'٠١٢٣٤٥٦٧٨٩']);
    expect(symbols.decimal).toBe('٫');
    expect(symbols.group).toBe('٬');
    expect(symbols.primaryGroupingSize).toBe(3);
    expect(symbols.secondaryGroupingSize).toBe(3);
  });

  it('strictly parses Arabic-Indic grouped decimals without altering separator semantics', () => {
    expect(parseLocalizedDecimal('١٢٬٣٤٥٫٦', 'ar-JO', { numberingSystem: 'arab' })).toMatchObject({
      ok: true,
      value: 12345.6,
      normalized: '12345.6',
      numberingSystem: 'arab',
    });
  });

  it('parses runtime-formatted Arabic negatives including derived bidi literals', () => {
    const formatted = new Intl.NumberFormat('ar-JO', {
      numberingSystem: 'arab',
      useGrouping: true,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(-12345.6);

    expect(parseLocalizedDecimal(formatted, 'ar-JO', { numberingSystem: 'arab' })).toMatchObject({
      ok: true,
      value: -12345.6,
      normalized: '-12345.6',
    });
  });

  it('strictly parses Extended Arabic-Indic input for Persian', () => {
    expect(parseLocalizedDecimal('-۱۲٬۳۴۵٫۶', 'fa-IR', { numberingSystem: 'arabext' })).toMatchObject({
      ok: true,
      value: -12345.6,
      normalized: '-12345.6',
      numberingSystem: 'arabext',
    });
  });

  it('accepts ASCII digits with locale punctuation by default', () => {
    expect(parseLocalizedDecimal('12٬345٫6', 'ar-JO', { numberingSystem: 'arab' })).toMatchObject({
      ok: true,
      value: 12345.6,
      normalized: '12345.6',
    });
  });

  it('makes cross-Arabic digit variants explicit instead of silently accepting them', () => {
    expect(parseLocalizedDecimal('۱۲۳', 'ar-JO', { numberingSystem: 'arab' })).toMatchObject({
      ok: false,
      reason: 'invalid-character',
    });
    expect(parseLocalizedDecimal('۱۲۳', 'ar-JO', {
      numberingSystem: 'arab',
      digitAcceptance: 'arabic-flex',
    })).toMatchObject({
      ok: true,
      value: 123,
      normalized: '123',
    });
  });

  it('can require locale-native digits only', () => {
    expect(parseLocalizedDecimal('123', 'ar-JO', {
      numberingSystem: 'arab',
      digitAcceptance: 'locale',
    })).toMatchObject({ ok: false, reason: 'invalid-character' });
  });

  it('validates non-Western grouping patterns such as en-IN', () => {
    expect(parseLocalizedDecimal('12,34,567.89', 'en-IN')).toMatchObject({
      ok: true,
      value: 1234567.89,
      normalized: '1234567.89',
    });
    expect(parseLocalizedDecimal('1,234,567.89', 'en-IN')).toMatchObject({
      ok: false,
      reason: 'invalid-grouping',
    });
  });

  it('rejects malformed grouping and grouping in the fraction', () => {
    expect(parseLocalizedDecimal('12,34.5', 'en-US')).toMatchObject({ ok: false, reason: 'invalid-grouping' });
    expect(parseLocalizedDecimal('1.2,3', 'en-US')).toMatchObject({ ok: false, reason: 'group-in-fraction' });
    expect(parseLocalizedDecimal('1,234', 'en-US', { allowGrouping: false })).toMatchObject({
      ok: false,
      reason: 'grouping-not-allowed',
    });
  });

  it('rejects multiple decimals, misplaced signs, exponents, and trailing decimals', () => {
    expect(parseLocalizedDecimal('1.2.3', 'en-US')).toMatchObject({ ok: false, reason: 'multiple-decimals' });
    expect(parseLocalizedDecimal('1-2', 'en-US')).toMatchObject({ ok: false, reason: 'misplaced-sign' });
    expect(parseLocalizedDecimal('1e3', 'en-US')).toMatchObject({ ok: false, reason: 'invalid-character' });
    expect(parseLocalizedDecimal('12.', 'en-US')).toMatchObject({ ok: false, reason: 'missing-fraction-digits' });
  });

  it('reports invalid-character indices against the original input after trimming edges', () => {
    expect(parseLocalizedDecimal('  12x ', 'en-US')).toMatchObject({
      ok: false,
      reason: 'invalid-character',
      index: 4,
    });
  });

  it('accepts a leading decimal and returns a canonical lexical form', () => {
    expect(parseLocalizedDecimal('.5', 'en-US')).toMatchObject({
      ok: true,
      value: 0.5,
      normalized: '0.5',
    });
  });

  it('reports empty and digit-free input without coercing it to zero', () => {
    expect(parseLocalizedDecimal('   ', 'en-US')).toMatchObject({ ok: false, reason: 'empty' });
    expect(parseLocalizedDecimal('+', 'en-US')).toMatchObject({ ok: false, reason: 'missing-digits' });
  });

  it('rejects magnitudes that JavaScript Number cannot represent as finite', () => {
    const huge = '9'.repeat(400);
    expect(parseLocalizedDecimal(huge, 'en-US')).toMatchObject({ ok: false, reason: 'non-finite' });
  });
});
