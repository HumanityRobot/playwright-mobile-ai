import fs from 'fs';
import path from 'path';
import type { Browser } from 'webdriverio';
import { ObjectRepository } from '../core/object-repository/object.repository';

export class MobileActions {
  private readonly repository: ObjectRepository;

  private readonly screenshotDirectory =
    path.resolve(
      process.cwd(),
      'reports',
      'screenshots'
    );

  private readonly executionScreenshots: string[] = [];

  constructor(
    private readonly driver: Browser,
    platform: 'android' | 'ios'
  ) {
    this.repository = new ObjectRepository(platform);

    this.prepareScreenshotDirectory();
  }

  /**
   * Prepare screenshot directory.
   *
   * Screenshot lama dihapus agar reporter
   * hanya membaca evidence dari execution
   * yang sedang berjalan.
   */
  private prepareScreenshotDirectory(): void {
    fs.mkdirSync(
      this.screenshotDirectory,
      {
        recursive: true,
      }
    );

    const files =
      fs.readdirSync(
        this.screenshotDirectory
      );

    for (const fileName of files) {
      if (
        fileName
          .toLowerCase()
          .endsWith('.png')
      ) {
        fs.unlinkSync(
          path.join(
            this.screenshotDirectory,
            fileName
          )
        );
      }
    }
  }

  /**
   * Click object.
   *
   * Click → screenshot → register evidence.
   */
  async click(
    objectName: string
  ): Promise<void> {
    const xpath =
      this.repository.get(
        objectName
      );

    const element =
      await this.driver.$(xpath);

    await element.click();

    await this.screenshot(
      objectName
    );
  }

  /**
   * Input value into object.
   *
   * Clear → input → screenshot → register evidence.
   */
  async input(
    objectName: string,
    value: string
  ): Promise<void> {
    const xpath =
      this.repository.get(
        objectName
      );

    const element =
      await this.driver.$(xpath);

    await element.clearValue();

    await element.setValue(
      value
    );

    await this.screenshot(
      objectName
    );
  }

  /**
   * Clear object value.
   */
  async clear(
    objectName: string
  ): Promise<void> {
    const xpath =
      this.repository.get(
        objectName
      );

    const element =
      await this.driver.$(xpath);

    await element.clearValue();

    await this.screenshot(
      objectName
    );
  }

  /**
   * Check whether object is visible.
   *
   * Tidak membuat screenshot karena
   * method ini hanya conditional check.
   */
  async isVisible(
    objectName: string
  ): Promise<boolean> {
    const xpath =
      this.repository.get(
        objectName
      );

    const element =
      await this.driver.$(xpath);

    return await element.isDisplayed();
  }

  /**
   * Wait until object is visible.
   */
  async waitFor(
    objectName: string,
    timeout = 10000
  ): Promise<void> {
    const xpath =
      this.repository.get(
        objectName
      );

    const element =
      await this.driver.$(xpath);

    await element.waitForDisplayed({
      timeout,
    });
  }

  /**
   * Press device / keyboard key.
   */
  async pressKey(
    key: string
  ): Promise<void> {
    await this.driver.keys([
      key,
    ]);
  }

  /**
   * Hide mobile keyboard.
   */
  async hideKeyboard(): Promise<void> {
    await this.driver.hideKeyboard();
  }

  /**
   * Android / iOS back action.
   */
  async backDevice(): Promise<void> {
    await this.driver.back();
  }

  /**
   * Take screenshot and register it
   * into the current execution sequence.
   */
  async screenshot(
    fileName: string
  ): Promise<string> {
    const screenshot =
      await this.driver.takeScreenshot();

    const filePath =
      path.join(
        this.screenshotDirectory,
        `${fileName}.png`
      );

    fs.writeFileSync(
      filePath,
      Buffer.from(
        screenshot,
        'base64'
      )
    );

    /*
     * Register screenshot in exact
     * execution order.
     */
    this.executionScreenshots.push(
      filePath
    );

    return filePath;
  }

  /**
   * Return screenshots generated during
   * the current mobile execution.
   */
  getScreenshots(): string[] {
    return [
      ...this.executionScreenshots,
    ];
  }
}