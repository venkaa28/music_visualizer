import { browser, logging, by, element } from 'protractor';
import { AppPage } from './app.po';

const baseUrl = 'https://music-visualizer-b2ae6.web.app/';

describe('Home Page', () => {
  let page: AppPage;

  beforeEach(async () => {
    await browser.get(baseUrl);
    //page = new AppPage();
  });

  it('should display welcome message', async () => {
    //await page.navigateTo("");
    let title = await element(by.xpath('/html/body/app-root/app-home-page/html/body/header/div/div[1]/div/h1/strong'));
    let titleText = await title.getText();
    expect(titleText).toEqual('WELCOME TO THE MUSIC VISUALIZER');
  });

  it('Homepage URL', async () => {
    expect(await browser.getCurrentUrl()).toEqual('beans');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});

describe('Login Page', () => {
  let page: AppPage;

  beforeEach(async () => {
    await browser.get(baseUrl);
    //page = new AppPage();
  });

  it('should display welcome message asdfsdafas', async () => {
    //await page.navigateTo("");
    let title = await element(by.xpath('/html/body/app-root/app-home-page/html/body/header/div/div[1]/div/h1/strong'));
    let titleText = await title.getText();
    expect(titleText).toEqual('WELCOME TO THE MUSIC VISUALIZER');
  });

  it('Homepage URLfdsghfd', async () => {
    expect(await browser.getCurrentUrl()).toEqual('beans');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
