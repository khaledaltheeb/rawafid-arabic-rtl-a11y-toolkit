import { describe, expect, it } from 'vitest';
import {
  formatDateParts,
  formatDisplayName,
  formatDisplayNames,
  formatListParts,
  formatNumberParts,
  formatRelativeTimeParts,
  resolveDisplayNames,
  resolvePluralRules,
  selectPluralCategory,
  segmentSentences,
  segmentWords,
  words,
} from '../../src';

describe('deep internationalization primitives', () => {
  it('segments Arabic and English words without whitespace splitting assumptions', () => {
    const arabic = segmentWords('مرحبا بالعالم، أهلاً بك.', 'ar');
    expect(arabic.some((entry) => entry.segment === 'مرحبا' && entry.isWordLike)).toBe(true);
    expect(words('مرحبا بالعالم، أهلاً بك.', 'ar').length).toBeGreaterThanOrEqual(4);

    const english = words("Rawafid supports Arabic and English.", 'en');
    expect(english).toEqual(['Rawafid', 'supports', 'Arabic', 'and', 'English']);
  });

  it('segments sentence boundaries using the runtime Unicode implementation', () => {
    const segments = segmentSentences('الجملة الأولى. الجملة الثانية! Third sentence.', 'ar');
    expect(segments.length).toBe(3);
    expect(segments.map((entry) => entry.segment).join('')).toBe('الجملة الأولى. الجملة الثانية! Third sentence.');
  });

  it('exposes Arabic cardinal plural categories through Intl.PluralRules', () => {
    expect(selectPluralCategory(0, 'ar')).toBe('zero');
    expect(selectPluralCategory(1, 'ar')).toBe('one');
    expect(selectPluralCategory(2, 'ar')).toBe('two');
    expect(selectPluralCategory(3, 'ar')).toBe('few');
    expect(selectPluralCategory(11, 'ar')).toBe('many');
    expect(selectPluralCategory(100, 'ar')).toBe('other');
    expect(resolvePluralRules('ar').locale.startsWith('ar')).toBe(true);
    expect(() => selectPluralCategory(Number.POSITIVE_INFINITY, 'ar')).toThrow(RangeError);
  });

  it('formats locale display names without freezing translated wording', () => {
    const arabicName = formatDisplayName('ar', 'en', { type: 'language' });
    expect(typeof arabicName).toBe('string');
    expect(arabicName?.length).toBeGreaterThan(0);

    const names = formatDisplayNames(['Arab', 'Latn'], 'en', { type: 'script' });
    expect(names).toHaveLength(2);
    expect(names.every((name) => typeof name === 'string' && name.length > 0)).toBe(true);
    expect(resolveDisplayNames('ar', { type: 'region' }).locale.startsWith('ar')).toBe(true);
  });

  it('returns structured formatter parts that reconstruct the formatted value', () => {
    const numberParts = formatNumberParts(12500.5, 'ar-JO');
    expect(numberParts.length).toBeGreaterThan(0);
    expect(numberParts.some((part) => part.type === 'integer')).toBe(true);

    const dateParts = formatDateParts(new Date('2026-08-25T00:00:00Z'), 'en-GB', {
      timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit',
    });
    expect(dateParts.some((part) => part.type === 'year')).toBe(true);

    const listParts = formatListParts(['العربية', 'English'], 'ar');
    expect(listParts.some((part) => part.type === 'element')).toBe(true);

    const relativeParts = formatRelativeTimeParts(-2, 'day', 'ar', { numeric: 'always' });
    expect(relativeParts.length).toBeGreaterThan(0);
  });
});
