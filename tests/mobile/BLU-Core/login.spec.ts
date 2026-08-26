import { test } from '../../../src/mobile/mobile.fixture';
import { LoginFlow } from '../../../src/flows/login.flow';

test(
  'Login to blu application',
  {
    tag: ['@smoke', '@login'],
  },
  async ({ login }: { login: LoginFlow }) => {
    await login.newLogin(
      '082297271996',
      'Password123!'
    );
  }
);