import { browser, by, element, ExpectedConditions } from 'protractor';

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

  // This is awful
  // but it's what is required for protractor to work on non-angular pages
  async nonAngularClickElement(xpath): Promise<unknown> {
    const elem = await(element(by.xpath(xpath)));
    await browser.actions().mouseMove(elem).click().perform();
    await browser.sleep(1000);
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

  // Assumes you're already on the login page
  async logInAs(userName, userPassword): Promise<unknown> {
    // Location of email
    const emailXPath = '/html/body/app-root/app-login-page/html/body/section/form/div[1]/input';
    // Location of password
    const passXPath = '/html/body/app-root/app-login-page/html/body/section/form/div[2]/input';
    // Location of Log In button
    const loginXPath = '/html/body/app-root/app-login-page/html/body/section/form/div[4]/button';

    // Location of 'remember me' checkbox
    const remXPath = '/html/body/app-root/app-login-page/html/body/section/form/div[3]/input';


    // Enter sample email
    await this.typeElement(emailXPath, userName);
    // Enter sample password
    await this.typeElement(passXPath, userPassword);

    // click remember me
    // await this.clickElement(remXPath);

    await browser.waitForAngularEnabled(false);

    // Click login button
    await this.clickElement(loginXPath);

    // This is a large page to load, must chill for a sec
    return await browser.wait(ExpectedConditions.visibilityOf(element(by.xpath('/html/body/app-root/app-visualization-page/html/body/div[2]/p'))), 5000);
  }
}
