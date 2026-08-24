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
  const liveRegion = page.locator('[role="status"][aria-live="polite"]');
  await expect(liveRegion).toHaveText('تم حفظ الإعدادات');
  await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
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

test('typeahead executes from the built package and moves focus by locale-aware label prefix', async ({ page }) => {
  const arabic = page.getByRole('tab', { name: 'العربية' });
  const english = page.getByRole('tab', { name: 'English' });
  const buffer = page.locator('#typeahead-buffer');
  await arabic.focus();
  await page.keyboard.press('E');
  await expect(english).toBeFocused();
  await expect(english).toHaveAttribute('aria-selected', 'true');
  await expect(buffer).toHaveText('E');
});

test('typeahead does not consume modified shortcuts or composition keystrokes', async ({ page }) => {
  const arabic = page.getByRole('tab', { name: 'العربية' });
  const buffer = page.locator('#typeahead-buffer');
  await arabic.focus();

  await page.keyboard.press('Control+E');
  await expect(arabic).toBeFocused();
  await expect(buffer).toHaveText('');

  await arabic.dispatchEvent('keydown', {
    key: 'ف',
    code: 'KeyF',
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  await expect(arabic).toBeFocused();
  await expect(buffer).toHaveText('');
});

test('built grid helper drives physical RTL movement, rows, and Home/End', async ({ page }) => {
  const first = page.locator('#grid-0');
  const middle = page.locator('#grid-1');
  const third = page.locator('#grid-2');
  const secondRowFirst = page.locator('#grid-3');

  await first.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(middle).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(first).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(secondRowFirst).toBeFocused();

  await page.keyboard.press('End');
  await expect(page.locator('#grid-5')).toBeFocused();

  await page.keyboard.press('Home');
  await expect(secondRowFirst).toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(first).toBeFocused();

  await page.keyboard.press('End');
  await expect(third).toBeFocused();
});

test('RTL grid keeps one cell in the page tab sequence', async ({ page }) => {
  const cells = page.locator('#rtl-grid [role="gridcell"]');
  await expect(cells.nth(0)).toHaveAttribute('tabindex', '0');
  for (let index = 1; index < 6; index += 1) {
    await expect(cells.nth(index)).toHaveAttribute('tabindex', '-1');
  }
});

test('QA helpers execute from the built browser package', async ({ page }) => {
  await expect(page.locator('#grapheme-output')).toHaveText('A…');
  await expect(page.locator('#pseudo-output')).toContainText('{name}');
  await expect(page.locator('#pseudo-output')).not.toHaveText('Hello {name}');
  await expect(page.locator('#unicode-risk')).toContainText('mixed-script');
});
