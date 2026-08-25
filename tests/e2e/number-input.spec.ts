import { expect, test } from '@playwright/test';
import type * as ToolkitModule from '../../src/index';

type Toolkit = typeof ToolkitModule;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('built browser package round-trips runtime-formatted Arabic negatives', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const moduleUrl = '/dist/index.js';
    const toolkit = await import(moduleUrl) as Toolkit;
    const formatted = new Intl.NumberFormat('ar-JO', {
      numberingSystem: 'arab',
      useGrouping: true,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(-12345.6);
    return {
      formatted,
      parsed: toolkit.parseLocalizedDecimal(formatted, 'ar-JO', { numberingSystem: 'arab' }),
      symbols: toolkit.getLocaleNumberSymbols('ar-JO', { numberingSystem: 'arab' }),
    };
  });

  expect(result.parsed).toMatchObject({
    ok: true,
    normalized: '-12345.6',
    value: -12345.6,
    numberingSystem: 'arab',
  });
  expect(result.symbols.digits.join('')).toBe('٠١٢٣٤٥٦٧٨٩');
  expect(result.symbols.decimal).toBe('٫');
  expect(result.symbols.group).toBe('٬');
});

test('built browser package validates Indian grouping instead of assuming groups of three', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const moduleUrl = '/dist/index.js';
    const toolkit = await import(moduleUrl) as Toolkit;
    return {
      valid: toolkit.parseLocalizedDecimal('12,34,567.89', 'en-IN'),
      invalid: toolkit.parseLocalizedDecimal('1,234,567.89', 'en-IN'),
      symbols: toolkit.getLocaleNumberSymbols('en-IN'),
    };
  });

  expect(result.valid).toMatchObject({ ok: true, normalized: '1234567.89', value: 1234567.89 });
  expect(result.invalid).toMatchObject({ ok: false, reason: 'invalid-grouping' });
  expect(result.symbols.primaryGroupingSize).toBe(3);
  expect(result.symbols.secondaryGroupingSize).toBe(2);
});

test('cross-Arabic digit acceptance remains explicit in the built browser package', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const moduleUrl = '/dist/index.js';
    const toolkit = await import(moduleUrl) as Toolkit;
    return {
      defaultPolicy: toolkit.parseLocalizedDecimal('۱۲۳', 'ar-JO', { numberingSystem: 'arab' }),
      flexiblePolicy: toolkit.parseLocalizedDecimal('۱۲۳', 'ar-JO', {
        numberingSystem: 'arab',
        digitAcceptance: 'arabic-flex',
      }),
    };
  });

  expect(result.defaultPolicy).toMatchObject({ ok: false, reason: 'invalid-character' });
  expect(result.flexiblePolicy).toMatchObject({ ok: true, normalized: '123', value: 123 });
});
