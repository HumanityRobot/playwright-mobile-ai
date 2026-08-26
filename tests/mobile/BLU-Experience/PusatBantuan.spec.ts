import { test } from '../../../src/mobile/mobile.fixture';

test(
  'Launch blu application - click Yuk Mulai',
  {
    tag: ['@smoke', '@launch'],
  },
  async ({ mobile }) => {
    await mobile.click('login_btnYukMulai');

    await mobile.screenshot('LaunchApp_YukMulai');
  }
);