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
