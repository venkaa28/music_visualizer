import { browser, by, element } from 'protractor';

export class AppPage {
  async navigateTo(url): Promise<unknown> {
    return browser.get(url);
  }

  // // how to get elements by css
  // async getTitleText(): Promise<string> {
  //   return element(by.css('app-root .content span')).getText();
  // }

  async clickElement(xpath): Promise<unknown> {
    const elem = await element(by.xpath(xpath));
    return elem.click();
  }

  async typeElement(xpath, text): Promise<unknown> {
    const elem = await(element(by.xpath(xpath)));
    return elem.sendKeys(text);
  }

  async getElementText(xpath): Promise<string> {
    const elem = await element(by.xpath(xpath));
    const titleText = await elem.getText();
    return titleText;
  }
}
