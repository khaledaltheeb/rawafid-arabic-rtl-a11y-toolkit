import { expect, test } from '@playwright/test';

test('forced-colors profile preserves an explicit visible focus indicator', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/conformance-lab');

  const control = page.locator('[data-forced-colors-focus]');
  await control.focus();
  await expect(control).toBeFocused();

  const evidence = await control.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      forcedColorsActive: matchMedia('(forced-colors: active)').matches,
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
      outlineOffset: computed.outlineOffset,
    };
  });

  expect(evidence.forcedColorsActive).toBe(true);
  expect(evidence.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(evidence.outlineWidth)).toBeGreaterThanOrEqual(2);
  expect(Number.parseFloat(evidence.outlineOffset)).toBeGreaterThanOrEqual(2);
});

test('reduced-motion profile collapses authored animation and transition durations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/conformance-lab');

  const style = await page.locator('[data-motion-probe]').evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      reducedMotionActive: matchMedia('(prefers-reduced-motion: reduce)').matches,
      animationDuration: computed.animationDuration,
      animationIterationCount: computed.animationIterationCount,
      transitionDuration: computed.transitionDuration,
      scrollBehavior: computed.scrollBehavior,
    };
  });

  expect(style.reducedMotionActive).toBe(true);
  expect(Number.parseFloat(style.animationDuration)).toBeLessThanOrEqual(0.001);
  expect(Number.parseFloat(style.transitionDuration)).toBeLessThanOrEqual(0.001);
  expect(style.animationIterationCount).toBe('1');
  expect(style.scrollBehavior).toBe('auto');
});
