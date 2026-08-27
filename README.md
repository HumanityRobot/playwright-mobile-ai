````markdown
# blu Mobile Automation

Mobile automation framework for the blu UAT application using Playwright, WebdriverIO, Appium 2, Android, TypeScript, and PDFKit.

---

## Tech Stack

- Playwright Test
- WebdriverIO
- Appium 2
- Android
- TypeScript
- PDFKit

---

## Project Architecture

```text
Playwright Test
       |
       v
Mobile Fixture
       |
       v
MobileActions
       |
       v
WebdriverIO
       |
       v
Appium 2
       |
       v
Android Device / Emulator
       |
       v
blu UAT Application
````

---

## Project Structure

```text
playwright-mobile/
│
├── assets/
│   └── report/
│       ├── logo/
│       └── icons/
│
├── objects/
│   ├── androidObject.properties
│   └── iosObject.properties
│
├── reports/
│   ├── screenshots/
│   └── pdf/
│
├── src/
│   ├── core/
│   │   ├── object-repository/
│   │   │   └── object.repository.ts
│   │   │
│   │   ├── report/
│   │   │   ├── pdf.reporter.ts
│   │   │   └── playwright.reporter.ts
│   │   │
│   │   └── runner/
│   │       └── test.runner.ts
│   │
│   ├── flows/
│   │   └── login.flow.ts
│   │
│   └── mobile/
│       ├── mobile.actions.ts
│       └── mobile.fixture.ts
│
├── tests/
│   └── mobile/
│       └── BLU-Core/
│           └── login.spec.ts
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# Object Repository

Object Repository digunakan untuk menyimpan locator Android dan iOS secara terpisah.

```text
objects/
├── androidObject.properties
└── iosObject.properties
```

Format object:

```properties
login_btnYukMulai=xpath;//android.widget.Button[@text="Yuk Mulai"]
```

`ObjectRepository` akan membaca file berdasarkan platform:

```text
android → androidObject.properties
ios     → iosObject.properties
```

Saat action membutuhkan object, cukup gunakan nama object:

```ts
await this.mobile.click(
  'login_btnYukMulai'
);
```

Locator tidak perlu ditulis langsung di test atau flow.

---

# Mobile Actions

`MobileActions` merupakan abstraction layer untuk interaksi dengan aplikasi mobile.

## Available Actions

| Action           | Status | Fungsi                            |
| ---------------- | :----: | --------------------------------- |
| `click()`        |    ✅   | Klik object + screenshot          |
| `input()`        |    ✅   | Clear + input value + screenshot  |
| `screenshot()`   |    ✅   | Screenshot manual                 |
| `clear()`        |    ✅   | Clear object + screenshot         |
| `isVisible()`    |    ✅   | Mengecek object terlihat          |
| `waitFor()`      |    ✅   | Menunggu object tampil            |
| `pressKey()`     |    ✅   | Menekan keyboard key + screenshot |
| `hideKeyboard()` |    ✅   | Menutup keyboard + screenshot     |
| `backDevice()`   |    ✅   | Menekan tombol Back device        |

Semua action yang berinteraksi dengan object menggunakan Object Repository.

Contoh:

```ts
await mobile.click(
  'login_btnYukMulai'
);

await mobile.input(
  'login_txtNoHp',
  nomor
);
```

---

# Mobile Fixture

Mobile fixture bertanggung jawab membuat Appium session dan menyediakan `MobileActions` ke testcase.

Flow:

```text
Playwright Test
      |
      v
Mobile Fixture
      |
      v
createAppiumSession()
      |
      v
WebdriverIO Browser
      |
      v
MobileActions
```

Session akan ditutup setelah test selesai:

```ts
try {
  await use(mobile);
} finally {
  await driver.deleteSession();
}
```

---

# Login Flow

Business flow untuk login dipisahkan dari testcase melalui:

```text
src/flows/login.flow.ts
```

## New Login

Flow:

```text
Yuk Mulai
    ↓
Input nomor HP
    ↓
Privacy Policy
    ↓
Back Device
    ↓
Lanjut
    ↓
OTP Bottom Sheet
    ↓
OTP SMS
    ↓
Location Permission
    ↓
Input OTP
    ↓
Input Password
    ↓
Show Password
    ↓
Masuk
    ↓
Security Onboarding
```

Object yang digunakan berasal dari Object Repository.

## PIN Login

Flow:

```text
Masuk Pre-login
    ↓
PIN Keypad
    ↓
Input PIN
    ↓
Dashboard / Homepage
```

PIN dimasukkan berdasarkan digit:

```ts
for (const digit of pin) {
  await this.mobile.click(
    `PINDEVICE_btn${digit}`
  );
}
```

---

# Test Runner

Test Runner digunakan untuk menjalankan testcase berdasarkan Test ID.

File:

```text
src/core/runner/test.runner.ts
```

Runner akan:

```text
Test ID
   ↓
Scan tests/
   ↓
Cari testcase yang mengandung Test ID
   ↓
Temukan .spec.ts
   ↓
Jalankan Playwright
```

Test ID tidak perlu didaftarkan satu per satu di runner.

---

# Running Test

## Direct Playwright

Test dapat dijalankan langsung menggunakan Playwright:

```bash
npx playwright test tests/mobile/BLU-Core/login.spec.ts
```

Untuk menggunakan reporter PDF secara langsung:

```bash
npx playwright test tests/mobile/BLU-Core/login.spec.ts --reporter=./src/core/report/playwright.reporter.ts
```

---

## Test Runner

Runner menggunakan script generic dari `package.json`:

```json
"scripts": {
  "test": "tsx src/core/runner/test.runner.ts"
}
```

Test ID diberikan sebagai argument:

```bash
npm run test -- DL05124062


Sebelum nya : npx playwright test tests/mobile/BLU-Core/login.spec.ts \
--reporter=./src/core/report/playwright.reporter.ts
```

Contoh lainnya:

```bash
npm run test -- DL05124063
npm run test -- DL05124064
```

Tidak diperlukan perubahan `package.json` untuk setiap Test ID baru.

---

# Test Case

Contoh testcase:

```ts
import { test } from '../../../src/mobile/mobile.fixture';
import { LoginFlow } from '../../../src/flows/login.flow';

test(
  'Login to blu application',
  {
    tag: [
      '@DL05124062',
      '@smoke',
      '@login',
    ],
  },
  async ({ mobile }) => {
    const login =
      new LoginFlow(mobile);

    await login.newLogin(
      '082297271996',
      'Password123!'
    );
  }
);
```

Test ID dapat digunakan oleh Test Runner untuk menemukan testcase.

---

# Reporting

Framework memiliki PDF Reporter custom:

```text
src/core/report/
├── pdf.reporter.ts
└── playwright.reporter.ts
```

Reporter akan mengumpulkan:

* Test scenario
* Test status
* Test tags
* Total execution
* Passed
* Failed
* Skipped
* Screenshot evidence

---

# Screenshot Evidence

Setiap action tertentu dapat menghasilkan screenshot.

Screenshot disimpan di:

```text
reports/screenshots/
```

Contoh:

```text
reports/screenshots/
├── login_btnYukMulai.png
├── login_txtNoHp.png
├── login_btnLoginCTA.png
├── login_btmSheetChooseOTPSMS.png
└── login_btnInputPassword.png
```

Screenshot digunakan sebagai evidence pada PDF report.

---

# PDF Report

PDF report disimpan di:

```text
reports/pdf/
```

Contoh:

```text
reports/pdf/
└── smoke.pdf
```

PDF report terdiri dari:

```text
Page 1
→ Test Execution Report
→ Scenario
→ Tags
→ Execution Metrics
→ Result Breakdown
→ Execution Environment

Page 2
→ Test Evidence
→ Screenshot

Page 3
→ Execution Assessment
→ Phase Coverage
→ Automation Stack
→ Reporting Direction
```

---

# Report Status

Reporter menggunakan status Playwright:

```text
passed
failed
skipped
interrupted
timedOut
```

Status execution dipetakan ke report:

```text
passed
    ↓
PASSED

failed
timedOut
interrupted
    ↓
FAILED

skipped
    ↓
SKIPPED
```

Dengan demikian testcase yang mengalami timeout tidak dianggap sebagai skipped.

---

# Reporting Architecture

```text
Playwright
     |
     v
onTestEnd()
     |
     +── Test Status
     +── Scenario
     +── Tags
     +── Screenshot
     |
     v
ExecutionSummary
     |
     v
pdf.reporter.ts
     |
     v
reports/pdf/
```

---

# Execution Environment

Current automation environment:

```text
Platform     : Android
Environment  : blu UAT
Automation   : WebdriverIO
Driver       : Appium 2
Test Runner  : Playwright
Language     : TypeScript
Reporting    : PDFKit
```

---

# Development Direction

Framework dikembangkan secara bertahap dengan pemisahan layer:

```text
Tests
  ↓
Flows
  ↓
Mobile Actions
  ↓
Object Repository
  ↓
WebdriverIO
  ↓
Appium
  ↓
Mobile Application
```

Tujuan architecture ini adalah menjaga testcase tetap sederhana, reusable, dan mudah dipelihara ketika jumlah scenario automation bertambah.

```

Satu catatan: di README ini gue mengikuti **action yang terakhir kita sepakati** (`clear`, `isVisible`, `waitFor`, `pressKey`, `hideKeyboard`, `backDevice`). Pastikan method-method tersebut memang sudah ada di `mobile.actions.ts`; kalau belum, bagian tabel README sebaiknya kita update setelah implementasinya.
```
