import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads the built toolkit and resolves script direction correctly', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('#script-direction')).toHaveAttribute('data-direction', 'ltr');
  await expect(page.locator('#script-direction')).toContainText('ar-Latn: ltr');
});

test('controlled Arabic RTL fixture has no automated axe violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('keyboard focus remains visible and ordered in RTL', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByText('تجاوز إلى المحتوى')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('actual logical CSS maps inline-start to the physical right edge in RTL', async ({ page }) => {
  const position = await page.locator('.logical-probe').evaluate((element) => {
    const style = getComputedStyle(element);
    return { left: style.left, right: style.right };
  });
  expect(position.right).toBe('16px');
});

test('actual live-region helper announces plain text', async ({ page }) => {
  await page.getByRole('button', { name: 'أعلن حالة الحفظ' }).click();
  await expect(page.getByRole('status')).toHaveText('تم حفظ الإعدادات');
  await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite');
});

test('mixed-direction values are isolated and layout does not overflow horizontally', async ({ page }) => {
  await expect(page.locator('bdi')).toHaveText('support@example.org');
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflows).toBe(false);
});
