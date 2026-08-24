import { describe, expect, it } from 'vitest';
import { formatDate, formatList, formatNumber, formatRelativeTime } from '../../src/i18n/format';
import { localeFallbackChain, selectBestLocale } from '../../src/i18n/locale';
import { interpolateMessage, resolveMessage } from '../../src/i18n/catalog';

describe('localization utilities', () => {
  it('builds fallback chains and chooses compatible locales', () => {
    expect(localeFallbackChain('ar-JO', 'en')).toEqual(['ar-JO', 'ar', 'en']);
    expect(selectBestLocale(['ar-JO'], ['en', 'ar-EG'], 'en')).toBe('ar-EG');
  });

  it('never crosses script boundaries during language fallback', () => {
    expect(selectBestLocale(['az-Arab'], ['az-Latn', 'en'], 'en')).toBe('en');
    expect(selectBestLocale(['az-Latn-AZ'], ['az-Latn-TR', 'en'], 'en')).toBe('az-Latn-TR');
  });

  it('returns undefined when no locale is available', () => {
    expect(selectBestLocale(['ar'], [], 'en')).toBeUndefined();
  });

  it('formats values through Intl', () => {
    expect(formatNumber(1234, 'ar-EG')).toMatch(/[١٢٣٤]/u);
    expect(formatDate('2026-08-24T00:00:00Z', 'en-GB', { timeZone: 'UTC', year: 'numeric' })).toContain('2026');
    expect(formatList(['A', 'B'], 'en')).toContain('A');
    expect(formatRelativeTime(-1, 'day', 'en')).toBe('yesterday');
  });

  it('resolves fallback strings and interpolates placeholders', () => {
    const catalogs = { ar: { hello: 'مرحبا {name}' }, en: { hello: 'Hello {name}', bye: 'Bye' } };
    expect(resolveMessage('bye', 'ar', catalogs, 'en')).toMatchObject({ value: 'Bye', fallbackUsed: true });
    expect(interpolateMessage('مرحبا {name}', { name: 'خالد' })).toBe('مرحبا خالد');
  });
});
