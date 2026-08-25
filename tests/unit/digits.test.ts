import { describe, expect, it } from 'vitest';
import {
  containsMixedDigitSystems,
  convertDigits,
  detectDigitSystems,
  normalizeDigitsForSearch,
} from '../../src/text/digits';

describe('decimal digit systems', () => {
  it('detects Latin, Arabic-Indic, and Extended Arabic-Indic digits', () => {
    expect(detectDigitSystems('123').systems).toEqual(['latn']);
    expect(detectDigitSystems('١٢٣').systems).toEqual(['arab']);
    expect(detectDigitSystems('۱۲۳').systems).toEqual(['arabext']);
  });

  it('reports mixed systems without mutating input', () => {
    const source = 'A12٣۴';
    const report = detectDigitSystems(source);
    expect(report.systems).toEqual(['latn', 'arab', 'arabext']);
    expect(report.counts).toEqual({ latn: 2, arab: 1, arabext: 1 });
    expect(report.digitCount).toBe(4);
    expect(report.mixed).toBe(true);
    expect(containsMixedDigitSystems(source)).toBe(true);
    expect(source).toBe('A12٣۴');
  });

  it('normalizes recognized decimal digits for search', () => {
    expect(normalizeDigitsForSearch('الإصدار ٢٥ / نسخه ۲۵ / v25')).toBe('الإصدار 25 / نسخه 25 / v25');
  });

  it('preserves punctuation, signs, separators, and surrounding text', () => {
    expect(normalizeDigitsForSearch('−١٢٬٣٤٥٫٦٪')).toBe('−12٬345٫6٪');
    expect(normalizeDigitsForSearch('+۱۲,۳۴۵.۶%')).toBe('+12,345.6%');
  });

  it('does not reinterpret non-decimal numeric characters', () => {
    expect(normalizeDigitsForSearch('Ⅻ ² ① ٤')).toBe('Ⅻ ² ① 4');
  });

  it('converts recognized digits explicitly to each target system', () => {
    expect(convertDigits('Room 12 / ٣٤ / ۵۶', 'latn')).toBe('Room 12 / 34 / 56');
    expect(convertDigits('Room 12 / ٣٤ / ۵۶', 'arab')).toBe('Room ١٢ / ٣٤ / ٥٦');
    expect(convertDigits('Room 12 / ٣٤ / ۵۶', 'arabext')).toBe('Room ۱۲ / ۳۴ / ۵۶');
  });

  it('preserves identifier structure while normalizing only decimal digits', () => {
    expect(normalizeDigitsForSearch('acct-٠٠٧/۱۲۳-ABC')).toBe('acct-007/123-ABC');
  });
});
