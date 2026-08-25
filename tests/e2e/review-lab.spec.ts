import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/review-lab');
});

test('loads the built toolkit and exposes an executable review surface', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-review-surface', 'v1');
  await expect(page.locator('#runtime-badge')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#locale-direction')).toHaveValue('rtl');
  await expect(page.locator('#text-direction')).toHaveValue('rtl');
  await expect(page.locator('#plural-output')).toHaveValue('few');
  await expect(page.locator('#scripts-output')).toContainText('Arabic');
  await expect(page.locator('#scripts-output')).toContainText('Latin');
  await expect(page.locator('#risks-output')).toContainText('mixed-script');
});

test('switching locale proves script-sensitive direction rather than language-only inference', async ({ page }) => {
  await page.locator('#locale').selectOption('az-Latn');
  await expect(page.locator('#locale-direction')).toHaveValue('ltr');
  await expect(page.locator('#runtime-badge')).toContainText('az-Latn');

  await page.locator('#locale').selectOption('az-Arab');
  await expect(page.locator('#locale-direction')).toHaveValue('rtl');
  await expect(page.locator('#runtime-badge')).toContainText('az-Arab');
});

test('sample editing updates first-strong direction and grapheme diagnostics', async ({ page }) => {
  const sample = page.locator('#sample');
  await sample.fill('Hello 👨‍👩‍👧‍👦');
  await expect(page.locator('#text-direction')).toHaveValue('ltr');
  await expect(sample).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#grapheme-output')).toHaveValue('7');
});

test('public review surface has no automated axe violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('review surface does not create horizontal overflow on narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflows).toBe(false);
});
