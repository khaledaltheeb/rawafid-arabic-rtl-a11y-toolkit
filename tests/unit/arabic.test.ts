import { describe, expect, it } from 'vitest';
import { createArabicSearchKey, hasArabicScript, normalizeArabicText, stripArabicDiacritics } from '../../src/text/arabic';

describe('Arabic text utilities', () => {
  it('detects Arabic script', () => {
    expect(hasArabicScript('Arabic العربية')).toBe(true);
    expect(hasArabicScript('English only')).toBe(false);
  });

  it('removes Arabic combining marks across Unicode Arabic blocks', () => {
    expect(stripArabicDiacritics('السَّلَامُ')).toBe('السلام');
    expect(stripArabicDiacritics(`ا\u08F0`)).toBe('ا');
  });

  it('normalizes conservatively without conflating distinct letters', () => {
    expect(normalizeArabicText('إِسْــلام')).toBe('اسلام');
    expect(normalizeArabicText('مدرسة')).toBe('مدرسة');
  });

  it('creates a stable search key', () => {
    expect(createArabicSearchKey('  إِلَى   المدرسة  ')).toBe('الي المدرسة');
  });
});
