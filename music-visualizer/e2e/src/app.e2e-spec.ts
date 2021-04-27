import { browser, logging, by, element } from 'protractor';
import { AppPage } from './app.po';

const baseUrl = 'https://music-visualizer-b2ae6.web.app/';

describe('Home Page', () => {
  let page: AppPage;

  beforeEach(async () => {
    // Make new page starting at home page
    page = new AppPage();
    await page.navigateTo(baseUrl);
  });

  it('Title', async () => {
    // location of the title text
    const xpath = '/html/body/app-root/app-home-page/html/body/header/div/div[1]/div/h1/strong';
    expect(await page.getElementText(xpath)).toEqual('WELCOME TO THE MUSIC VISUALIZER');
  });

  it('URL', async () => {
    expect(await browser.getCurrentUrl()).toEqual(baseUrl);
  });

  it ('Nav About Us', async() => {
    // Location of about us button
    const xpath = '/html/body/app-root/app-home-page/html/body/nav/div/div/ul/li[1]/a';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'AboutPage');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});

// describe('Login Page', () => {
//   let page: AppPage;

//   beforeEach(async () => {
//     await browser.get(baseUrl);
//     //page = new AppPage();
//   });

//   it('should display welcome message asdfsdafas', async () => {
//     //await page.navigateTo("");
//     let title = await element(by.xpath('/html/body/app-root/app-home-page/html/body/header/div/div[1]/div/h1/strong'));
//     let titleText = await title.getText();
//     expect(titleText).toEqual('WELCOME TO THE MUSIC VISUALIZER');
//   });

//   it('Homepage URLfdsghfd', async () => {
//     expect(await browser.getCurrentUrl()).toEqual('beans');
//   });

//   afterEach(async () => {
//     // Assert that there are no errors emitted from the browser
//     const logs = await browser.manage().logs().get(logging.Type.BROWSER);
//     expect(logs).not.toContain(jasmine.objectContaining({
//       level: logging.Level.SEVERE,
//     } as logging.Entry));
//   });
// });
