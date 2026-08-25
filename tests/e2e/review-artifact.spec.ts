import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/artifact/review-lab/');
});

test('deployable artifact executes the packaged toolkit from relative resources', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-review-surface', 'v1');
  await expect(page.locator('#runtime-badge')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#locale-direction')).toHaveText('rtl');
  await expect(page.locator('#text-direction')).toHaveText('rtl');

  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name));
  expect(resources.some((url) => url.endsWith('/artifact/dist/index.js'))).toBe(true);
  expect(resources.some((url) => url.endsWith('/artifact/review-lab/site.js'))).toBe(true);
  expect(resources.some((url) => url.endsWith('/artifact/styles/a11y.css'))).toBe(true);
});

test('deployable artifact enforces a self-contained strict CSP', async ({ page }) => {
  const policy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(policy).toContain("default-src 'none'");
  expect(policy).toContain("script-src 'self'");
  expect(policy).toContain("style-src 'self'");
  expect(policy).toContain("connect-src 'none'");
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("base-uri 'none'");
  expect(policy).toContain("form-action 'none'");
  expect(policy).not.toContain("'unsafe-inline'");
  expect(policy).not.toContain("'unsafe-eval'");

  const inlineResult = await page.evaluate(async () => {
    const violation = new Promise<string>((resolve) => {
      document.addEventListener('securitypolicyviolation', (event) => resolve(event.violatedDirective), { once: true });
    });
    const script = document.createElement('script');
    script.textContent = "document.documentElement.dataset.cspInlineExecuted = 'true';";
    document.head.append(script);
    const directive = await Promise.race([
      violation,
      new Promise<string>((resolve) => setTimeout(() => resolve('timeout'), 1000)),
    ]);
    return {
      directive,
      executed: document.documentElement.dataset.cspInlineExecuted === 'true',
    };
  });

  expect(inlineResult.executed).toBe(false);
  expect(inlineResult.directive).toContain('script-src');
});

test('deployable artifact preserves explicit script direction semantics', async ({ page }) => {
  await page.locator('#locale').selectOption('az-Latn');
  await expect(page.locator('#locale-direction')).toHaveText('ltr');

  await page.locator('#locale').selectOption('az-Arab');
  await expect(page.locator('#locale-direction')).toHaveText('rtl');
});

test('deployable artifact remains axe-clean and reflows at 320 CSS pixels', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.setViewportSize({ width: 320, height: 720 });
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflows).toBe(false);
});

test('served artifact manifest describes the tested deployment contract', async ({ request }) => {
  const response = await request.get('/artifact/artifact-manifest.json');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({
    schemaVersion: 1,
    artifact: 'rawafid-public-review-lab',
    entrypoint: 'review-lab/index.html',
    deploymentModel: 'static-files-subpath-safe',
  });
  expect(manifest.files.map((entry: { path: string }) => entry.path)).toContain('dist/index.js');
  expect(manifest.files.map((entry: { path: string }) => entry.path)).toContain('review-lab/index.html');
});
