import { expect, test } from '@playwright/test';

type Toolkit = typeof import('../../src/index');

async function loadToolkitInBrowser(): Promise<Toolkit> {
  return (0, eval)('import("/dist/index.js")') as Promise<Toolkit>;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('built browser package preserves source text while normalizing decimal digits for search', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const toolkit = await (0, eval)('import("/dist/index.js")') as Toolkit;
    const source = 'الإصدار ۲۵ — القيمة ١٢٬٥٠٠';
    return {
      source,
      normalized: toolkit.normalizeDigitsForSearch(source),
      report: toolkit.detectDigitSystems(source),
    };
  });

  expect(result.source).toBe('الإصدار ۲۵ — القيمة ١٢٬٥٠٠');
  expect(result.normalized).toBe('الإصدار 25 — القيمة 12٬500');
  expect(result.report.systems).toEqual(['arab', 'arabext']);
  expect(result.report.mixed).toBe(true);
});

test('built locale-aware typeahead treats Latin, Arabic-Indic, and Eastern Arabic-Indic digits as search-equivalent', async ({ page }) => {
  const matches = await page.evaluate(async () => {
    const toolkit = await (0, eval)('import("/dist/index.js")') as Toolkit;
    const items = [
      { label: 'الإصدار ٢٥' },
      { label: 'الإصدار ۲۶' },
      { label: 'الإصدار 27' },
    ];
    return {
      latin: toolkit.findTypeaheadMatch(items, 'الإصدار 25', { locale: 'ar' }),
      arabicIndic: toolkit.findTypeaheadMatch(items, 'الإصدار ٢٦', { locale: 'ar' }),
      easternArabicIndic: toolkit.findTypeaheadMatch(items, 'الإصدار ۲۷', { locale: 'ar' }),
    };
  });

  expect(matches).toEqual({ latin: 0, arabicIndic: 1, easternArabicIndic: 2 });
});

test('digit conversion preserves punctuation, separators, signs, and unrelated Unicode numerics', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const toolkit = await (0, eval)('import("/dist/index.js")') as Toolkit;
    return toolkit.convertDigits('−١٢٫٥٪ | +۱۲٬۵۰۰ | Ⅻ²', 'latn');
  });

  expect(result).toBe('−12٫5٪ | +12٬500 | Ⅻ²');
});

void loadToolkitInBrowser;
