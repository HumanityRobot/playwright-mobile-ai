import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['./src/core/report/playwright.reporter.ts'],
  ],

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'mobile',
      testDir: './tests/mobile',
    },
  ],
});