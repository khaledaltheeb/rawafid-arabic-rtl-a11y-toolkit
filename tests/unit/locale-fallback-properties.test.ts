import { describe, expect, it } from 'vitest';
import { localeFallbackChain, selectBestLocale } from '../../src/i18n/locale';
import { normalizeLocaleTag } from '../../src/rtl/direction';

describe('locale extension and fallback invariants', () => {
  it('preserves the canonical extended request before progressively broadening fallback', () => {
    const requested = normalizeLocaleTag('ar_JO_u_nu_latn');
    const chain = localeFallbackChain('ar_JO_u_nu_latn');

    expect(chain[0]).toBe(requested);
    expect(chain).toContain('ar-JO');
    expect(chain.at(-1)).toBe('ar');
    expect(new Set(chain).size).toBe(chain.length);
  });

  it('removes extensions for compatible available translations without crossing scripts', () => {
    expect(selectBestLocale(
      ['ar-JO-u-nu-latn'],
      ['ar-JO', 'ar-EG', 'en'],
    )).toBe('ar-JO');

    expect(selectBestLocale(
      ['az-Arab-AZ-u-nu-latn'],
      ['az-Latn-AZ', 'az-Arab-IR', 'en'],
    )).toBe('az-Arab-IR');
  });

  it('keeps explicit script selection authoritative across region and extension differences', () => {
    const cases = [
      {
        requested: 'az-Arab-AZ-u-ca-gregory',
        available: ['az-Latn-AZ', 'az-Arab-IR'],
        expected: 'az-Arab-IR',
      },
      {
        requested: 'sr-Latn-RS-u-nu-latn',
        available: ['sr-Cyrl-RS', 'sr-Latn-BA'],
        expected: 'sr-Latn-BA',
      },
      {
        requested: 'pa-Arab-PK-u-ca-gregory',
        available: ['pa-Guru-IN', 'pa-Arab-PK'],
        expected: 'pa-Arab-PK',
      },
    ] as const;

    for (const sample of cases) {
      expect(selectBestLocale([sample.requested], sample.available)).toBe(sample.expected);
    }
  });

  it('uses the configured default only when requested script-compatible candidates do not exist', () => {
    expect(selectBestLocale(
      ['az-Arab-AZ'],
      ['az-Latn-AZ', 'en-GB', 'en-US'],
      'en-US-u-nu-latn',
    )).toBe('en-US');
  });

  it('falls back deterministically to the first available locale when no request or default is compatible', () => {
    expect(selectBestLocale(
      ['az-Arab-AZ'],
      ['fr-FR', 'de-DE'],
    )).toBe('fr-FR');
  });
});
