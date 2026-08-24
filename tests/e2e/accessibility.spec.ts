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
  await expect(page.locator('bdi').first()).toHaveText('support@example.org');
  await expect(page.locator('#email')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('navigation', { name: 'مسار الصفحة' })).toContainText('API v2');
  await expect(page.getByRole('region', { name: 'نتائج قابلة للتمرير' })).toContainText('ar-JO');
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflows).toBe(false);
});

test('roving tab interaction follows RTL arrows and skips disabled tabs', async ({ page }) => {
  const arabic = page.getByRole('tab', { name: 'العربية' });
  const english = page.getByRole('tab', { name: 'English' });
  const disabled = page.getByRole('tab', { name: 'غير متاح' });
  const persian = page.getByRole('tab', { name: 'فارسی' });

  await arabic.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(english).toBeFocused();
  await expect(english).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('ArrowLeft');
  await expect(persian).toBeFocused();
  await expect(disabled).toBeDisabled();

  await page.keyboard.press('ArrowRight');
  await expect(english).toBeFocused();
});

test('QA helpers execute from the built browser package', async ({ page }) => {
  await expect(page.locator('#grapheme-output')).toHaveText('A…');
  await expect(page.locator('#pseudo-output')).toContainText('{name}');
  await expect(page.locator('#pseudo-output')).not.toHaveText('Hello {name}');
  await expect(page.locator('#unicode-risk')).toContainText('mixed-script');
});
