import { expect, test } from '@playwright/test';

test('dir=auto and bdi preserve mixed-direction semantics', async ({ page }) => {
  await page.goto('/conformance-lab');

  await expect(page.locator('html')).toHaveAttribute('data-conformance-lab', 'v1');

  const directions = await page.locator('[data-dir-auto]').evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).direction),
  );

  expect(directions).toEqual(['rtl', 'ltr']);
  await expect(page.locator('[data-bdi]')).toHaveAttribute('dir', null);
});

test('dirname submits the user-entered field direction', async ({ page }) => {
  await page.goto('/conformance-lab');

  const field = page.locator('[data-direction-field]');
  await expect(field).toHaveAttribute('dir', 'auto');
  await expect(field).toHaveAttribute('dirname', 'message.dir');

  await field.fill('مرحبا بالعالم');
  await page.locator('[data-submit]').click();

  await expect(page).toHaveURL(/\/echo\?/);
  const payload = await page.locator('body').textContent();
  const parsed = JSON.parse(payload ?? '{}') as Record<string, string>;
  expect(parsed.message).toBe('مرحبا بالعالم');
  expect(parsed['message.dir']).toBe('rtl');
});

test('WCAG-oriented target floor is at least 24 by 24 CSS pixels', async ({ page }) => {
  await page.goto('/conformance-lab');

  const sizes = await page.locator('[data-target], [data-submit]').evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  );

  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) {
    expect(size.width).toBeGreaterThanOrEqual(24);
    expect(size.height).toBeGreaterThanOrEqual(24);
  }
});

test('320 CSS pixel viewport reflows without two-dimensional page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/conformance-lab');

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
