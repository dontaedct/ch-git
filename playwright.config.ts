/**
 * @fileoverview OSS Hero Design Safety - Playwright Configuration
 * @description Playwright configuration for accessibility and UI testing
 * @version 1.0.0
 * @author OSS Hero Design Safety Module
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Enhanced timeout settings for HT-008.7.3 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts$/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.spec\.ts$/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.spec\.ts$/,
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*\.spec\.ts$/,
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /.*\.spec\.ts$/,
    },

    // Enhanced E2E tests (HT-008.7.3)
    {
      name: 'e2e-enhanced',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/e2e\/enhanced-.*\.spec\.ts$/,
    },
    {
      name: 'e2e-api',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/e2e\/api-integration\.spec\.ts$/,
    },
    {
      name: 'e2e-performance',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/e2e\/performance\.spec\.ts$/,
    },

    // UI tests
    {
      name: 'ui-tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/ui\/.*\.spec\.ts$/,
    },

    // Visual regression tests
    {
      name: 'visual-regression',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/visual\/.*\.spec\.ts$/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? {
    command: 'npx next dev --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      ...process.env,
      __NEXT_DISABLE_DEVTOOLS: '1', // Disable Next.js dev tools in tests
    },
  } : undefined,
  
  /* Global test timeout */
  timeout: 30 * 1000,
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 5000,
  },
  
  /* Global setup and teardown - only in local development */
  ...(process.env.CI ? {} : {
    globalSetup: './tests/ui/global-setup.ts',
    globalTeardown: './tests/ui/global-teardown.ts',
  }),
});
