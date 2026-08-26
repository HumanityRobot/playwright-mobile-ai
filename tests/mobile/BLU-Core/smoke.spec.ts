import { test, expect } from '@playwright/test';

test(
  'BLU-Core smoke test',
  {
    tag: '@C11A',
  },
  async ({ page }) => {
    await page.goto('https://www.google.com');

    await expect(page).toHaveTitle(/Google/);
  }
);