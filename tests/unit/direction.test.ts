import { describe, expect, it } from 'vitest';
import { dirAttributes, getLocaleDirection, getTextDirection, normalizeLocaleTag } from '../../src/rtl/direction';

const RTL_SCRIPT_TAGS = ['Adlm', 'Arab', 'Gara', 'Hebr', 'Rohg', 'Mand', 'Mend', 'Nkoo', 'Hung', 'Samr', 'Syrc', 'Thaa', 'Yezi'] as const;
const RTL_SCRIPT_CODE_POINTS = [0x1e900, 0x0627, 0x10d50, 0x05d0, 0x10d00, 0x0840, 0x1e800, 0x07ca, 0x10c80, 0x0800, 0x0710, 0x0780, 0x10e80] as const;

describe('direction utilities', () => {
  it('detects the first strong RTL or LTR character', () => {
    expect(getTextDirection('123 — مرحباً بالعالم')).toBe('rtl');
    expect(getTextDirection('123 — Hello العالم')).toBe('ltr');
    expect(getTextDirection('12345', 'rtl')).toBe('rtl');
    expect(getTextDirection('𐵀 123 A')).toBe('ltr'); // Garay digit is not itself a strong RTL letter.
    expect(getTextDirection('\u061C123')).toBe('rtl');
    expect(getTextDirection('\u200Eمرحبا')).toBe('ltr');
  });

  it('keeps mixed-script identifiers first-strong and neutral-safe', () => {
    const cases = [
      ['user_123-مرحبا', 'ltr'],
      ['مرحبا-user_123', 'rtl'],
      ['v2.4/שלום', 'ltr'],
      ['שלום/v2.4', 'rtl'],
      ['2026-08-26:abc_مرحبا', 'ltr'],
      ['2026-08-26:مرحبا_abc', 'rtl'],
    ] as const;

    for (const [value, expected] of cases) {
      expect(getTextDirection(value), value).toBe(expected);
    }
  });

  it('recognizes all supported modern RTL script families', () => {
    for (const script of RTL_SCRIPT_TAGS) {
      expect(getLocaleDirection(`und-${script}`), script).toBe('rtl');
    }
    for (const codePoint of RTL_SCRIPT_CODE_POINTS) {
      expect(getTextDirection(String.fromCodePoint(codePoint)), codePoint.toString(16)).toBe('rtl');
    }
  });

  it('derives direction from script rather than language alone', () => {
    expect(getLocaleDirection('ar-JO')).toBe('rtl');
    expect(getLocaleDirection('fa-IR')).toBe('rtl');
    expect(getLocaleDirection('he-IL')).toBe('rtl');
    expect(getLocaleDirection('en-US')).toBe('ltr');
    expect(getLocaleDirection('az-Arab')).toBe('rtl');
    expect(getLocaleDirection('az-Latn')).toBe('ltr');
    expect(getLocaleDirection('ar-Latn')).toBe('ltr');
  });

  it('uses caller fallback for invalid locale tags', () => {
    expect(getLocaleDirection('not a locale', 'rtl')).toBe('rtl');
  });

  it('canonicalizes locale tags and returns attributes', () => {
    expect(normalizeLocaleTag('ar_jo')).toBe('ar-JO');
    expect(dirAttributes('ar-JO')).toEqual({ lang: 'ar-JO', dir: 'rtl' });
  });
});
