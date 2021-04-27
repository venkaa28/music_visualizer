import { browser, by, element } from 'protractor';

export class AppPage {
  async navigateTo(url): Promise<unknown> {
    return browser.get(url);
  }

  // how to get elements by css
  async getTitleText(): Promise<string> {
    return element(by.css('app-root .content span')).getText();
  }

  async getNameText(): Promise<string> {
    return element(by.name('title')).getText();
  }
}
