import { defineConfig, devices } from '@playwright/test';

const ciOnlyConfig = process.env.CI ? { workers: 2 } : {};
const ciReporters = [
  ['github'] as const,
  ['html', { open: 'never' }] as const,
  ['json', { outputFile: 'partner-results/playwright-results.json' }] as const,
  ['junit', { outputFile: 'partner-results/junit.xml', includeProjectInTestName: true }] as const,
];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...ciOnlyConfig,
  reporter: process.env.CI ? ciReporters : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  webServer: {
    command: 'npm run build && node tests/e2e/server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'ar-JO',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
});
