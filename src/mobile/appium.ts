import { remote, type Browser } from 'webdriverio';

export async function createAppiumSession(): Promise<Browser> {
    return await remote({
        hostname: '127.0.0.1',
        port: 4723,
        path: '/wd/hub',

        capabilities: {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:udid': '10.109.197.20:5556',
            'appium:deviceName': 'Android Device',
            'appium:appPackage': 'com.bcadigital.blu.uat',
            'appium:appActivity':
                'com.bcadigital.blu.ui.splashScreen.BluSplashScreenActivity',
        },
    });
}