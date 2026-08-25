import { expect, test } from '@playwright/test';

test('dir=auto and bdi preserve mixed-direction semantics', async ({ page }) => {
  await page.goto('/conformance-lab');

  await expect(page.locator('html')).toHaveAttribute('data-conformance-lab', 'v1');

  const directions = await page.locator('[data-dir-auto]').evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).direction),
  );

  expect(directions).toEqual(['rtl', 'ltr']);
  await expect(page.locator('[data-bdi]')).not.toHaveAttribute('dir');
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

test('focused control is not obscured by author-created sticky content', async ({ page }) => {
  await page.goto('/conformance-lab');

  const viewport = page.locator('[data-focus-viewport]');
  const sticky = page.locator('[data-focus-sticky]');
  const target = page.locator('[data-focus-target]');

  await viewport.evaluate((element) => { element.scrollTop = 0; });
  await target.evaluate((element) => {
    element.scrollIntoView({ block: 'start', inline: 'nearest' });
    element.focus();
  });
  await expect(target).toBeFocused();

  const geometry = await page.evaluate(() => {
    const viewportElement = document.querySelector<HTMLElement>('[data-focus-viewport]');
    const stickyElement = document.querySelector<HTMLElement>('[data-focus-sticky]');
    const targetElement = document.querySelector<HTMLElement>('[data-focus-target]');
    if (!viewportElement || !stickyElement || !targetElement) throw new Error('Missing focus fixture element');
    const viewportRect = viewportElement.getBoundingClientRect();
    const stickyRect = stickyElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    return {
      viewportTop: viewportRect.top,
      viewportBottom: viewportRect.bottom,
      stickyBottom: stickyRect.bottom,
      targetTop: targetRect.top,
      targetBottom: targetRect.bottom,
    };
  });

  expect(geometry.stickyBottom).toBeGreaterThan(geometry.viewportTop);
  expect(geometry.targetBottom).toBeGreaterThan(geometry.stickyBottom);
  expect(geometry.targetTop).toBeGreaterThanOrEqual(geometry.stickyBottom - 1);
  expect(geometry.targetTop).toBeLessThan(geometry.viewportBottom);
});

test('WCAG text-spacing override does not clip content or functionality', async ({ page }) => {
  await page.goto('/conformance-lab');

  await page.locator('[data-spacing-sample]').evaluate((element) => {
    const root = element as HTMLElement;
    root.style.lineHeight = '1.5';
    root.style.letterSpacing = '0.12em';
    root.style.wordSpacing = '0.16em';
    for (const paragraph of root.querySelectorAll<HTMLElement>('[data-spacing-paragraph]')) {
      paragraph.style.marginBlockEnd = '2em';
    }
  });

  const result = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>('[data-spacing-card]');
    const sample = document.querySelector<HTMLElement>('[data-spacing-sample]');
    const control = document.querySelector<HTMLElement>('[data-spacing-control]');
    const paragraphs = [...document.querySelectorAll<HTMLElement>('[data-spacing-paragraph]')];
    if (!card || !sample || !control || paragraphs.length === 0) throw new Error('Missing spacing fixture');

    const cardRect = card.getBoundingClientRect();
    const controlRect = control.getBoundingClientRect();
    return {
      sampleOverflow: sample.scrollWidth > sample.clientWidth + 1,
      cardOverflow: card.scrollWidth > card.clientWidth + 1,
      paragraphHeights: paragraphs.map((paragraph) => paragraph.getBoundingClientRect().height),
      controlVisible: controlRect.height > 0 && controlRect.width > 0,
      controlInsideCard: controlRect.bottom <= cardRect.bottom + 1,
    };
  });

  expect(result.sampleOverflow).toBe(false);
  expect(result.cardOverflow).toBe(false);
  expect(result.paragraphHeights.every((height) => height > 0)).toBe(true);
  expect(result.controlVisible).toBe(true);
  expect(result.controlInsideCard).toBe(true);
  await page.locator('[data-spacing-control]').click();
});
