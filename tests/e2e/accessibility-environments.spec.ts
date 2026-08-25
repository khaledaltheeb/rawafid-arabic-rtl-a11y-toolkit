import { expect, test } from '@playwright/test';

test('forced-colors profile preserves an explicit visible focus indicator', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/conformance-lab');

  const control = page.locator('[data-forced-colors-focus]');
  await control.focus();
  await expect(control).toBeFocused();

  const style = await control.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
      outlineOffset: computed.outlineOffset,
      forcedColorAdjust: computed.forcedColorAdjust,
    };
  });

  expect(style.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
  expect(Number.parseFloat(style.outlineOffset)).toBeGreaterThanOrEqual(2);
  expect(style.forcedColorAdjust).toBe('auto');
});

test('reduced-motion profile collapses authored animation and transition durations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/conformance-lab');

  const style = await page.locator('[data-motion-probe]').evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      animationDuration: computed.animationDuration,
      animationIterationCount: computed.animationIterationCount,
      transitionDuration: computed.transitionDuration,
      scrollBehavior: computed.scrollBehavior,
    };
  });

  expect(Number.parseFloat(style.animationDuration)).toBeLessThanOrEqual(0.001);
  expect(Number.parseFloat(style.transitionDuration)).toBeLessThanOrEqual(0.001);
  expect(style.animationIterationCount).toBe('1');
  expect(style.scrollBehavior).toBe('auto');
});
