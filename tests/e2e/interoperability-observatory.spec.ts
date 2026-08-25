import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

test('capture Arabic/RTL and Intl interoperability observations', async ({ page }, testInfo) => {
  await page.goto('/conformance-lab');
  await expect(page.locator('html')).toHaveAttribute('data-conformance-lab', 'v1');

  const conformance = await page.evaluate(() => {
    const autoDirections = [...document.querySelectorAll<HTMLElement>('[data-dir-auto]')]
      .map((element) => getComputedStyle(element).direction);
    const segmenter = new Intl.Segmenter('ar', { granularity: 'grapheme' });
    const graphemes = [...segmenter.segment('مَرْحَبًا')].map((entry) => entry.segment);
    const numberFormat = new Intl.NumberFormat('ar-EG-u-nu-arab', {
      useGrouping: true,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    const locale = new Intl.Locale('ar-EG-u-nu-arab');
    const localePrototype = Intl.Locale.prototype as unknown as Record<string, unknown>;
    const pluralPrototype = Intl.PluralRules.prototype as unknown as Record<string, unknown>;

    return {
      autoDirections,
      graphemes,
      arabicNumber: numberFormat.format(1234567.5),
      numberingSystem: numberFormat.resolvedOptions().numberingSystem,
      localeNumberingSystem: locale.numberingSystem ?? null,
      capabilities: {
        segmenter: typeof Intl.Segmenter === 'function',
        displayNames: typeof Intl.DisplayNames === 'function',
        listFormat: typeof Intl.ListFormat === 'function',
        supportedValuesOf: typeof Intl.supportedValuesOf === 'function',
        pluralSelectRange: typeof pluralPrototype.selectRange === 'function',
        localeGetNumberingSystems: typeof localePrototype.getNumberingSystems === 'function',
        localeGetWeekInfo: typeof localePrototype.getWeekInfo === 'function',
        localeGetTextInfo: typeof localePrototype.getTextInfo === 'function',
      },
    };
  });

  await page.goto('/visual-reference');
  const logicalEdges = await page.evaluate(() => {
    const ltr = document.querySelector<HTMLElement>('[data-panel="ltr"] [data-card]');
    const rtl = document.querySelector<HTMLElement>('[data-panel="rtl"] [data-card]');
    if (!ltr || !rtl) throw new Error('Missing visual-reference logical cards.');
    const ltrStyle = getComputedStyle(ltr);
    const rtlStyle = getComputedStyle(rtl);
    return {
      ltr: {
        paddingLeft: ltrStyle.paddingLeft,
        paddingRight: ltrStyle.paddingRight,
        borderLeftWidth: ltrStyle.borderLeftWidth,
        borderRightWidth: ltrStyle.borderRightWidth,
      },
      rtl: {
        paddingLeft: rtlStyle.paddingLeft,
        paddingRight: rtlStyle.paddingRight,
        borderLeftWidth: rtlStyle.borderLeftWidth,
        borderRightWidth: rtlStyle.borderRightWidth,
      },
    };
  });

  const observation = {
    schemaVersion: 1,
    project: testInfo.project.name,
    generatedAt: new Date().toISOString(),
    runtime: {
      userAgent: await page.evaluate(() => navigator.userAgent),
      language: await page.evaluate(() => navigator.language),
    },
    observations: {
      ...conformance,
      logicalEdges,
    },
  };

  const directory = resolve('partner-results/interoperability-observations');
  await mkdir(directory, { recursive: true });
  await writeFile(
    resolve(directory, `${testInfo.project.name}.json`),
    `${JSON.stringify(observation, null, 2)}\n`,
    'utf8',
  );
});
