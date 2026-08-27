import { test } from '../../../src/mobile/mobile.fixture';
import { LoginFlow } from '../../../src/flows/login.flow';

test(
  'C13790 Pusat Bantuan check Pertanyaan populer',
  {
    tag: ['@smoke', '@C13790'],
  },
  async ({ login }: { login: LoginFlow }) => {
    await login.newLogin(
      '082297271996',
      'Password123!'
    );
  }
);``