import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('accessible reference patterns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/patterns');
  });

  test('disclosure exposes state and controls its panel', async ({ page }) => {
    const button = page.locator('#disclosure-button');
    const panel = page.locator('#disclosure-panel');

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'disclosure-panel');
    await expect(panel).toBeHidden();

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
  });

  test('menu button opens from keyboard and returns focus on Escape', async ({ page }) => {
    const button = page.locator('#menu-button');
    const items = page.locator('[role="menuitem"]');

    await button.focus();
    await page.keyboard.press('ArrowDown');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(items.first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(items.last()).toBeFocused();
  });

  test('RTL tabs use one tab stop, expose selection, and activate with direction-aware arrows', async ({ page }) => {
    const profile = page.locator('#tab-profile');
    const security = page.locator('#tab-security');
    const notifications = page.locator('#tab-notifications');

    await expect(profile).toHaveAttribute('aria-selected', 'true');
    await expect(profile).toHaveAttribute('tabindex', '0');
    await expect(security).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#panel-profile')).toBeVisible();
    await expect(page.locator('#panel-security')).toBeHidden();

    await profile.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(security).toBeFocused();
    await expect(security).toHaveAttribute('aria-selected', 'true');
    await expect(profile).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#panel-security')).toBeVisible();

    await page.keyboard.press('End');
    await expect(notifications).toBeFocused();
    await expect(notifications).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);

    await page.keyboard.press('ArrowLeft');
    await expect(profile).toBeFocused();
    await expect(profile).toHaveAttribute('aria-selected', 'true');
  });

  test('pagination exposes one current page and keeps gaps non-interactive', async ({ page }) => {
    const pagination = page.locator('#pagination');
    const current = pagination.locator('a[aria-current="page"]');
    const gaps = pagination.locator('.pagination-gap');

    await expect(pagination).toHaveAttribute('aria-label', 'صفحات النتائج');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('data-page', '7');
    await expect(current).toHaveAttribute('href', '#page-7');
    await expect(current).toHaveAttribute('aria-label', 'الصفحة 7، الصفحة الحالية');

    await expect(pagination.locator('a[rel="prev"]')).toHaveAttribute('data-page', '6');
    await expect(pagination.locator('a[rel="next"]')).toHaveAttribute('data-page', '8');
    await expect(gaps).toHaveCount(2);
    await expect(gaps.first()).toHaveAttribute('aria-hidden', 'true');
    await expect(pagination.locator('.pagination-gap a')).toHaveCount(0);
  });

  test('modal dialog contains Tab focus and restores focus after Escape', async ({ page }) => {
    const trigger = page.locator('#open-dialog');
    const dialog = page.locator('#dialog');
    const first = page.locator('#dialog-first');
    const last = page.locator('#dialog-last');

    await trigger.focus();
    await trigger.click();

    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    await expect(first).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(last).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(last).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('#dialog-backdrop')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('fixture has no automatically detectable accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
