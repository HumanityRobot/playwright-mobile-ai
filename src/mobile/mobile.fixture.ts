import { test as base } from '@playwright/test';

import type { Browser } from 'webdriverio';

import { createAppiumSession } from './appium';
import { MobileActions } from './mobile.actions';
import { LoginFlow } from '../flows/login.flow';

type MobileFixtures = {
  mobile: MobileActions;
  login: LoginFlow;
};

export const test =
  base.extend<MobileFixtures>({
    mobile: async ({}, use) => {
      const driver: Browser =
        await createAppiumSession();

      const mobile =
        new MobileActions(
          driver,
          'android'
        );

      try {
        await use(mobile);
      } finally {
        await driver.deleteSession();
      }
    },

    login: async (
      { mobile },
      use
    ) => {
      const login =
        new LoginFlow(mobile);

      await use(login);
    },
  });

export {
  expect,
} from '@playwright/test';