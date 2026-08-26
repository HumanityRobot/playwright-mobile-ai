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

## Action Mobile

| Action           | Status | Fungsi                          |
| ---------------- | :----: | ------------------------------- |
| `click()`        |    ✅   | Klik object + screenshot        |
| `input()`        |    ✅   | Clear + input + screenshot      |
| `screenshot()`   |    ✅   | Screenshot manual               |
| `clear()`        |    ✅   | Clear object + screenshot       |
| `isVisible()`    |    ✅   | Cek object terlihat             |
| `waitFor()`      |    ✅   | Tunggu object tampil            |
| `pressKey()`     |    ✅   | Tekan keyboard key + screenshot |
| `hideKeyboard()` |    ✅   | Tutup keyboard + screenshot     |
