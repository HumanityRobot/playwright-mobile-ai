import { test as base } from '@playwright/test';
import type { Browser } from 'webdriverio';
import { createAppiumSession } from './appium';
import { MobileActions } from './mobile.actions';

type MobileFixtures = {
  mobile: MobileActions;
};

export const test = base.extend<MobileFixtures>({
  mobile: async ({}, use) => {
    const driver: Browser = await createAppiumSession();

    const mobile = new MobileActions(driver, 'android');

    try {
      await use(mobile);
    } finally {
      await driver.deleteSession();
    }
  },
});

export { expect } from '@playwright/test';