import fs from 'fs';
import path from 'path';
import type { Browser } from 'webdriverio';
import { ObjectRepository } from '../core/object-repository/object.repository';

export class MobileActions {
  private readonly repository: ObjectRepository;

  constructor(
    private readonly driver: Browser,
    platform: 'android' | 'ios'
  ) {
    this.repository = new ObjectRepository(platform);
  }

  async click(objectName: string): Promise<void> {
    const xpath = this.repository.get(objectName);

    await this.driver.$(xpath).click();
  }

  async screenshot(fileName: string): Promise<string> {
    const screenshot = await this.driver.takeScreenshot();

    const directory = path.resolve(
      process.cwd(),
      'reports',
      'screenshots'
    );

    fs.mkdirSync(directory, { recursive: true });

    const filePath = path.join(directory, `${fileName}.png`);

    fs.writeFileSync(
      filePath,
      Buffer.from(screenshot, 'base64')
    );

    return filePath;
  }
}