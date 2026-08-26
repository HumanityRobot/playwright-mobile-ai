import fs from 'fs';
import path from 'path';

export type MobilePlatform = 'android' | 'ios';

export class ObjectRepository {
  private readonly objects: Map<string, string> = new Map();

  constructor(platform: MobilePlatform) {
    const fileName =
      platform === 'android'
        ? 'androidObject.properties'
        : 'iosObject.properties';

    const filePath = path.resolve(
      process.cwd(),
      'objects',
      fileName
    );

    this.load(filePath);
  }

  private load(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed
        .substring(0, separatorIndex)
        .trim();

      const value = trimmed
        .substring(separatorIndex + 1)
        .trim();

      const locatorSeparator = value.indexOf(';');

      if (locatorSeparator === -1) {
        continue;
      }

      const locatorType = value
        .substring(0, locatorSeparator)
        .trim();

      const locatorValue = value
        .substring(locatorSeparator + 1)
        .trim();

      if (locatorType.toLowerCase() !== 'xpath') {
        continue;
      }

      this.objects.set(key, locatorValue);
    }
  }

  public get(objectName: string): string {
    const locator = this.objects.get(objectName);

    if (!locator) {
      throw new Error(
        `Object '${objectName}' tidak ditemukan di object repository`
      );
    }

    return locator;
  }
}