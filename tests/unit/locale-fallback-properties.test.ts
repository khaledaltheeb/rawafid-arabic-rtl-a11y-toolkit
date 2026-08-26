import { describe, expect, it } from 'vitest';
import { localeFallbackChain, selectBestLocale } from '../../src/i18n/locale';
import { normalizeLocaleTag } from '../../src/rtl/direction';

const MULTI_SCRIPT_CASES = [
  { language: 'az', script: 'Arab', region: 'AZ', otherScript: 'Latn', otherRegion: 'IR' },
  { language: 'sr', script: 'Latn', region: 'RS', otherScript: 'Cyrl', otherRegion: 'BA' },
  { language: 'pa', script: 'Arab', region: 'PK', otherScript: 'Guru', otherRegion: 'IN' },
] as const;

describe('locale extension and fallback invariants', () => {
  it('preserves the canonical extended request before progressively broadening fallback', () => {
    const requested = normalizeLocaleTag('ar_JO_u_nu_latn');
    const chain = localeFallbackChain('ar_JO_u_nu_latn');

    expect(chain[0]).toBe(requested);
    expect(chain).toContain('ar-JO');
    expect(chain.at(-1)).toBe('ar');
    expect(new Set(chain).size).toBe(chain.length);
  });

  it('never invents a region fallback that drops an explicitly requested script', () => {
    for (const sample of MULTI_SCRIPT_CASES) {
      const requested = `${sample.language}-${sample.script}-${sample.region}-u-ca-gregory`;
      const chain = localeFallbackChain(requested);

      expect(chain[0]).toBe(normalizeLocaleTag(requested));
      expect(chain).toContain(`${sample.language}-${sample.script}`);
      expect(chain).not.toContain(`${sample.language}-${sample.region}`);
      expect(chain.at(-1)).toBe(sample.language);
      expect(new Set(chain).size).toBe(chain.length);
    }
  });

  it('keeps region fallback for locales that did not explicitly constrain script', () => {
    for (const locale of ['ar-JO-u-nu-latn', 'en-GB-u-ca-gregory', 'de-CH-u-nu-latn']) {
      const canonical = normalizeLocaleTag(locale);
      const parsed = new Intl.Locale(canonical);
      const chain = localeFallbackChain(locale);

      expect(chain[0]).toBe(canonical);
      expect(parsed.region ? chain : []).toContain(`${parsed.language}-${parsed.region}`);
      expect(chain.at(-1)).toBe(parsed.language);
    }
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
    for (const sample of MULTI_SCRIPT_CASES) {
      const requested = `${sample.language}-${sample.script}-${sample.region}-u-nu-latn`;
      const compatible = `${sample.language}-${sample.script}-${sample.otherRegion}`;
      const incompatible = `${sample.language}-${sample.otherScript}-${sample.region}`;

      expect(selectBestLocale([requested], [incompatible, compatible])).toBe(compatible);
      expect(selectBestLocale([requested], [compatible, incompatible])).toBe(compatible);
    }
  });

  it('is stable under available-locale ordering when a same-region compatible locale exists', () => {
    const permutations = [
      ['az-Arab-IR', 'az-Arab-AZ', 'az-Latn-AZ'],
      ['az-Latn-AZ', 'az-Arab-AZ', 'az-Arab-IR'],
      ['az-Arab-AZ', 'az-Latn-AZ', 'az-Arab-IR'],
    ] as const;

    for (const available of permutations) {
      expect(selectBestLocale(['az-Arab-AZ-u-ca-gregory'], available)).toBe('az-Arab-AZ');
    }
  });

  it('uses request priority before configured default priority', () => {
    expect(selectBestLocale(
      ['sr-Latn-RS', 'pa-Arab-PK'],
      ['pa-Arab-PK', 'sr-Latn-BA', 'en-US'],
      'en-US',
    )).toBe('sr-Latn-BA');
  });

  it('uses the configured default only when requested script-compatible candidates do not exist', () => {
    expect(selectBestLocale(
      ['az-Arab-AZ'],
      ['az-Latn-AZ', 'en-GB', 'en-US'],
      'en-US-u-nu-latn',
    )).toBe('en-US');
  });

  it('preserves default-locale region preference after stripping Unicode extensions', () => {
    const permutations = [
      ['en-GB', 'en-US'],
      ['en-US', 'en-GB'],
    ] as const;

    for (const available of permutations) {
      expect(selectBestLocale(
        ['az-Arab-AZ'],
        available,
        'en-US-u-nu-latn',
      )).toBe('en-US');
    }
  });

  it('falls back deterministically to the first available locale when no request or default is compatible', () => {
    expect(selectBestLocale(
      ['az-Arab-AZ'],
      ['fr-FR', 'de-DE'],
    )).toBe('fr-FR');
  });
});
