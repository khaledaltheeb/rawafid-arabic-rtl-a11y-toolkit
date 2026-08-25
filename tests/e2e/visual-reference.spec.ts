import { expect, test } from '@playwright/test';

test('RTL/LTR visual reference mirrors logical styling without overflow', async ({ page }) => {
  await page.goto('/visual-reference');

  await expect(page.locator('html')).toHaveAttribute('data-visual-fixture', 'rtl-ltr-v1');
  await expect(page.locator('[data-panel="ltr"]')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('[data-panel="rtl"]')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('[data-panel] [data-email]')).toHaveCount(2);
  await expect(page.locator('[data-panel] [data-email]')).toHaveAttribute('dir', 'ltr');

  const logicalEdges = await page.locator('[data-panel]').evaluateAll((panels) =>
    panels.map((panel) => {
      const card = panel.querySelector<HTMLElement>('[data-card]');
      if (!card) throw new Error('Missing logical card');
      const style = getComputedStyle(card);
      return {
        direction: getComputedStyle(panel).direction,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
        borderLeftWidth: style.borderLeftWidth,
        borderRightWidth: style.borderRightWidth,
      };
    }),
  );

  expect(logicalEdges).toEqual([
    {
      direction: 'ltr',
      paddingLeft: '24px',
      paddingRight: '14px',
      borderLeftWidth: '4px',
      borderRightWidth: '1px',
    },
    {
      direction: 'rtl',
      paddingLeft: '14px',
      paddingRight: '24px',
      borderLeftWidth: '1px',
      borderRightWidth: '4px',
    },
  ]);

  const overflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth);
});

test('visual reference remains semantically paired on narrow viewports', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/visual-reference');

  const panels = page.locator('[data-panel]');
  await expect(panels).toHaveCount(2);

  const boxes = await panels.evaluateAll((items) =>
    items.map((item) => {
      const rect = item.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width) };
    }),
  );

  expect(boxes[1]!.top).toBeGreaterThan(boxes[0]!.top);
  expect(Math.abs(boxes[0]!.left - boxes[1]!.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(boxes[0]!.width - boxes[1]!.width)).toBeLessThanOrEqual(1);

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});
