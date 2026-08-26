import { MobileActions } from '../mobile/mobile.actions';

export class LoginFlow {
  constructor(
    private readonly mobile: MobileActions
  ) {}

  /**
   * New Login Flow
   *
   * Yuk Mulai
   * → input nomor HP
   * → privacy policy
   * → Lanjut
   * → Update
   * → OTP SMS (if appeared)
   * → location permission (if appeared)
   * → OTP 1234
   * → password
   * → Masuk
   * → Security onboarding (if appeared)
   */
  async newLogin(
    nomor: string,
    password: string
  ): Promise<void> {
    // Tap Yuk Mulai
    await this.mobile.click(
      'login_btnYukMulai'
    );

    // Input nomor HP
    await this.mobile.input(
      'login_txtNoHp',
      nomor
    );

    // Privacy Policy
    await this.mobile.click(
      'login_checkboxPrivacyPolicy'
    );

    await this.mobile.backDevice();

    // Tap Lanjut
    await this.mobile.click(
      'login_btnLoginCTA'
    );

    // // =====================================================
    // // OTP BOTTOM SHEET
    // // =====================================================

    // if (
    //   await this.mobile.isVisible(
    //     'login_btmSheetOTP'
    //   )
    // ) {
    //   // Select OTP via SMS
    //   await this.mobile.click(
    //     'login_btmSheetChooseOTPSMS'
    //   );

    //   // Tap Lanjut
    //   await this.mobile.click(
    //     'login_btmSheetOTPLanjut'
    //   );
    // }

    // // =====================================================
    // // LOCATION PERMISSION
    // // =====================================================

    // if (
    //   await this.mobile.isVisible(
    //     'btnPermision'
    //   )
    // ) {
    //   await this.mobile.click(
    //     'btnPermision'
    //   );
    // }

    // // =====================================================
    // // OTP
    // // =====================================================

    // await this.mobile.input(
    //   'login_btnInputOTP',
    //   '1234'
    // );

    // // =====================================================
    // // PASSWORD
    // // =====================================================

    // await this.mobile.input(
    //   'login_txtPassword',
    //   password
    // );

    // // Show password
    // await this.mobile.click(
    //   'login_btnEye'
    // );

    // // =====================================================
    // // LOGIN
    // // =====================================================

    // await this.mobile.click(
    //   'login_btnInputPassword'
    // );

    // // =====================================================
    // // SECURITY ONBOARDING
    // // =====================================================

    // if (
    //   await this.mobile.isVisible(
    //     'login_txtSecurityOnboardingTitle'
    //   )
    // ) {
    //   await this.mobile.click(
    //     'login_btnSecurityOnboarding'
    //   );
    // }
  }

  /**
   * Pre-login PIN Flow
   *
   * Masuk
   * → PIN keypad
   * → Dashboard / Homepage
   */
  async pinLogin(
    pin: string
  ): Promise<void> {
    // Tap Masuk pada pre-login
    await this.mobile.click(
      'login_btnMasukPreLogin'
    );

    // Input PIN menggunakan keypad
    for (const digit of pin) {
      await this.mobile.click(
        `PINDEVICE_btn${digit}`
      );
    }

    // PIN berhasil
    // → Dashboard / Homepage
  }
}