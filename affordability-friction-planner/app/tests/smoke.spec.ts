import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APP_CONFIG = {
  name: 'affordability-friction-planner',
} as const;

let testArtifactsDir: string;
let consoleLogs: string[] = [];
let consoleErrors: string[] = [];
let pageErrors: string[] = [];
let failedRequests: string[] = [];

test('smoke test - app loads and displays home page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: APP_CONFIG.name, exact: false })).toBeVisible();
  await expect(page.getByText('care looks nearby')).toBeVisible();
  await expect(page.getByText('Travel time to trusted care')).toBeVisible();
  await expect(page.getByText('Persistence')).toBeVisible();
});

test.beforeEach(async ({ page }) => {
  consoleLogs = [];
  consoleErrors = [];
  pageErrors = [];
  failedRequests = [];

  testArtifactsDir = join(process.cwd(), '.smoke-test');
  mkdirSync(testArtifactsDir, { recursive: true });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (!text.trim() || /^%[osd]$/.test(text.trim())) return;
    consoleLogs.push(`[${type}] ${text}`);
    if (type === 'error') consoleErrors.push(text);
  });

  page.on('pageerror', (error) => {
    pageErrors.push(`Page error: ${error.message}`);
  });

  page.on('requestfailed', (request) => {
    failedRequests.push(`Failed request: ${request.url()} - ${request.failure()?.errorText}`);
  });
});

test.afterEach(async ({ page }, testInfo) => {
  const testName = testInfo.title.replace(/ /g, '-').toLowerCase();
  await page.screenshot({ path: join(testArtifactsDir, `${testName}-app-screenshot.png`), fullPage: true });
  writeFileSync(
    join(testArtifactsDir, `${testName}-console-logs.txt`),
    [
      '=== Console Logs ===',
      ...consoleLogs,
      '\n=== Console Errors ===',
      ...consoleErrors,
      '\n=== Page Errors ===',
      ...pageErrors,
      '\n=== Failed Requests ===',
      ...failedRequests,
    ].join('\n'),
    'utf-8',
  );
  await page.close();
});
