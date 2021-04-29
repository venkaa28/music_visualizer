import { browser, logging, by, element, ExpectedConditions} from 'protractor';
import { AppPage } from './app.po';

//const baseUrl = 'https://music-visualizer-b2ae6.web.app/';
const baseUrl = 'http://localhost:4200/';

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

  it ('Nav Register', async() => {
    // Location of sign up button
    const xpath = '/html/body/app-root/app-home-page/html/body/header/div/div[2]/a';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'RegisterPage');
  });

  it ('Nav Login', async() => {
    // Location of login button
    const xpath = '/html/body/app-root/app-home-page/html/body/nav/div/div/ul/li[2]/a';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'LoginPage');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});

describe('About Us Page', () => {
  let page: AppPage;

  beforeEach(async () => {
    // Make new page starting at About Us Page
    page = new AppPage();
    await page.navigateTo(baseUrl + 'AboutPage');
  });

  it('Title', async () => {
    // location of the title text
    const xpath = '/html/body/app-root/app-about-page/html/body/header/div/div[1]/div/h1/strong';
    expect(await page.getElementText(xpath)).toEqual('ABOUT US');
  });

  it('URL', async () => {
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'AboutPage');
  });

  it ('Nav Home Page', async() => {
    // Location of homepage button
    const xpath = '/html/body/app-root/app-about-page/html/body/nav/div/a';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + '#page-top');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});

describe('Register Page', () => {
  let page: AppPage;

  beforeEach(async () => {
    // Make new page starting at Register Page
    page = new AppPage();
    await page.navigateTo(baseUrl + 'RegisterPage');
  });

  it('Title', async () => {
    // location of the title text
    const xpath = '/html/body/app-root/app-register-page/html/body/section/div/form/h2';
    expect(await page.getElementText(xpath)).toEqual('Create an account.');
  });

  it('URL', async () => {
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'RegisterPage');
  });

  it ('Nav Home Page', async() => {
    // Location of homepage button
    const xpath = '/html/body/app-root/app-register-page/html/body/nav/div/a';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + '#page-top');
  });

  it ('Nav Login Page', async() => {
    // Location of login here
    const xpath = '/html/body/app-root/app-register-page/html/body/section/div/form/a';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'LoginPage');
  });

  it ('Empty Signup Click', async() => {
    // Location of signup button
    const xpath = '/html/body/app-root/app-register-page/html/body/section/div/form/div[7]/button';
    await page.clickElement(xpath);
    // no data has been entered, button should not be able to be clicked
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'RegisterPage');
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
    // Make new page starting at Login Page
    page = new AppPage();
    await page.navigateTo(baseUrl + 'LoginPage');
  });

  it('Title', async () => {
    // location of the title text
    const xpath = '/html/body/app-root/app-login-page/html/body/section/form/h1';
    expect(await page.getElementText(xpath)).toEqual('Login');
  });

  it('URL', async () => {
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'LoginPage');
  });

  it ('Nav Home Page', async() => {
    // Location of homepage button
    const xpath = '/html/body/app-root/app-login-page/html/body/nav/div/a';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl);
  });

  it ('Nav Forgot Password Page', async() => {
    // Location of forgot password
    const xpath = '/html/body/app-root/app-login-page/html/body/section/form/a[1]';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'ForgotPasswordPage');
  });

  it ('Nav Register Page', async() => {
    // Location of Register Here
    const xpath = '/html/body/app-root/app-login-page/html/body/section/form/a[2]';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'RegisterPage');
  });

  it ('Empty Login Click', async() => {
    // Location of Log In button
    const xpath = '/html/body/app-root/app-login-page/html/body/section/form/div[4]/button';
    await page.clickElement(xpath);
    // no data has been entered, button should not be able to be clicked
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'LoginPage');
  });

  it ('Log In', async() => {
    // Location of email
    const emailXPath = '/html/body/app-root/app-login-page/html/body/section/form/div[1]/input';
    // Location of password
    const passXPath = '/html/body/app-root/app-login-page/html/body/section/form/div[2]/input';
    // Location of Log In button
    const loginXPath = '/html/body/app-root/app-login-page/html/body/section/form/div[4]/button';

    // Enter sample email
    await page.typeElement(emailXPath, 'user2@wisc.edu');
    // Enter sample password
    await page.typeElement(passXPath, 'password123');

    await browser.waitForAngularEnabled(false);

    // Click login button
    await page.clickElement(loginXPath);

    // This is a large page to load, must chill for a sec

    await browser.wait(ExpectedConditions.visibilityOf(element(by.xpath('/html/body/app-root/app-visualization-page/html/body/div[2]/p'))), 10000);

    //await browser.wa

    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'VisualizationPage');
    browser.waitForAngularEnabled(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});

describe('Visualization Page', () => {
  let page: AppPage;

  beforeEach(async () => {
    // Make new page starting at Login Page
    page = new AppPage();
    browser.manage().deleteAllCookies();
    await page.navigateTo(baseUrl + 'LoginPage');
    //await browser.waitForAngularEnabled(false);
    await page.logInAs('user2@wisc.edu', 'password123');
    await browser.sleep(1000);
  });

  it('Title', async () => {
    // location of the title text
    const xpath = '/html/body/app-root/app-visualization-page/html/body/div[2]/p';
    //browser.wait(ExpectedConditions.visibilityOf, 1000);
    expect(await page.getElementText(xpath)).toEqual('Select an input source to visualize:');
  });

  it('URL', async () => {
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'VisualizationPage');
  });

  it('Nav Profile Page, Profile Button', async () => {
    // Location of profile page button
    const xpath = '/html/body/app-root/app-visualization-page/html/body/div[5]/div/div/div[3]/button[2]';

    await page.nonAngularClickElement(xpath);

    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'ProfilePage');
  });

  // it('Select Spotify as Source, noAuth', async () => {
  //   // location of spotify source button
  //   const sourceButtonXPath = '/html/body/app-root/app-visualization-page/html/body/div[2]/div/div[3]/div/a';
  //   await browser.sleep(10000);
  //   await page.nonAngularClickElement(sourceButtonXPath);
  //   expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'ProfilePage');
  // });

  it('Open audio settings', async () => {
    // Location of audio settings button
    const buttonXPath = '/html/body/app-root/app-visualization-page/html/body/div[5]/div/div/div[3]/button[3]/img';
    // Location of audio settings text
    const textXPath = '/html/body/app-root/app-visualization-page/html/body/div[3]/div/p';
    await page.nonAngularClickElement(buttonXPath);
    await browser.wait(ExpectedConditions.visibilityOf(element(by.xpath(textXPath))), 5000);
    expect(await page.getElementText(textXPath)).toEqual('Settings');
  });

  afterEach(async () => {
    // const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    // expect(logs).not.toContain(jasmine.objectContaining({
    //   level: logging.Level.SEVERE,
    // } as logging.Entry));
  });
});

describe('Profile Page', () => {
  let page: AppPage;

  beforeEach(async () => {
    // Make new page starting at Login Page
    page = new AppPage();
    browser.manage().deleteAllCookies();
    await page.navigateTo(baseUrl + 'LoginPage');
    //await browser.waitForAngularEnabled(false);
    await page.logInAs('user2@wisc.edu', 'password123');
    await browser.sleep(1000);
    const xpath = '/html/body/app-root/app-visualization-page/html/body/div[5]/div/div/div[3]/button[2]';
    await page.nonAngularClickElement(xpath);
    browser.ignoresynchronizaton = true
  });

  it('Title', async () => {
    // location of the title text
    const xpath = '/html/body/app-root/app-profile-page/html/body/header/div/div[1]/div/h1/strong';
    expect(await page.getElementText(xpath)).toEqual('PROFILE PAGE');
  });

  it('URL', async () => {
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'ProfilePage');
  });

  it('Nav Back to Visualizations Page', async () => {
    const xpath = '/html/body/app-root/app-profile-page/html/body/nav/div/a';
    await page.clickElement(xpath);
    await browser.waitForAngularEnabled(false);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl + 'VisualizationPage');
  });

  it('Logout should route back to Home page', async () => {
    const xpath = '/html/body/app-root/app-profile-page/html/body/header/div/div[2]/button[2]';
    await page.clickElement(xpath);
    expect(await browser.getCurrentUrl()).toEqual(baseUrl);
  });

  afterEach(async () => {
    // const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    // expect(logs).not.toContain(jasmine.objectContaining({
    //   level: logging.Level.SEVERE,
    // } as logging.Entry));
  });
});
