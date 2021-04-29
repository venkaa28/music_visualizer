const puppeteer = require('puppeteer');

const localHost = false;

var baseUrl;

if (localHost) {
  baseUrl = 'https://localhost:4200/';
} else {
  baseUrl = 'https://music-visualizer-b2ae6.web.app/';
}

async function startup() {
  const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: false});
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080
  });
  await page.goto(baseUrl, {
    waitUntil: 'networkidle2',
  });
  return { browser, page };
}

async function teardown(browser) {
  await browser.close();
}

async function clickOn(page, JSPath) {
  await page.click(JSPath, {
    waitUntil: 'networkidle2',
  });
}

async function typeIn(page, JSPath, entry) {
  await page.type(JSPath, entry, {
    waitUntil: 'networkidle2',
  });
}

async function test1_homePageLoad() {
  const { browser, page } = await startup();

  const curUrl = await page.url();
  if (curUrl !== baseUrl) {
    console.log('Error on test 1: Current URL is not the base URL');
    console.log('Expected: ' + baseUrl + ' Received: ' + curUrl);
  }

  await teardown(browser);
}

async function test2_registerPageNav() {
  const { browser, page } = await startup();
  const expectedUrl = baseUrl + 'RegisterPage';

  // go to register page
  await clickOn(page, '#page-top > header > div > div.col-lg-8.mx-auto > a');

  const curUrl = await page.url();
  if (curUrl !== expectedUrl) {
    console.log('Error on test 2: Current URL is not the register page');
    console.log('Expected: ' + expectedUrl + ' Received: ' + curUrl);
  }

  await teardown(browser);
}

async function test3_aboutUsPageNav() {
  const { browser, page } = await startup();
  const expectedUrl = baseUrl + 'AboutPage';

  // go to about us page

  try {
    await clickOn(page, '#navbarResponsive > ul > li:nth-child(1) > a');
  } catch (err) {
    console.log('Could not find button');
    console.log(err.message);
  }

  const curUrl = await page.url();
  if (curUrl !== expectedUrl) {
    console.log('Error on test 3: Current URL is not the about us page');
    console.log('Expected: ' + expectedUrl + ' Received: ' + curUrl);
  }

  await teardown(browser);
}

async function test4_aboutUsToHomePageNav() {
  const { browser, page } = await startup();
  const expectedUrl = baseUrl + '#page-top';

  await clickOn(page, '#navbarResponsive > ul > li:nth-child(1) > a');

  try {
    await clickOn(page, '#mainNav > div > a');
  } catch (err) {
    console.log('Could not find button');
    console.log(err.message);
  }

  const curUrl = await page.url();
  if (curUrl !== expectedUrl) {
    console.log('Error on test 4: Current URL is not the home page');
    console.log('Expected: ' + expectedUrl + ' Received: ' + curUrl);
  }

  await teardown(browser);
}

async function test5_loginPageNav() {
  const { browser, page } = await startup();
  const expectedUrl = baseUrl + 'LoginPage';

  // go to login page

  try {
    await clickOn(page, '#navbarResponsive > ul > li:nth-child(2) > a');
  } catch (err) {
    console.log('Could not find button');
    console.log(err.message);
  }

  const curUrl = await page.url();
  if (curUrl !== expectedUrl) {
    console.log('Error on test 5: Current URL is not the login page');
    console.log('Expected: ' + expectedUrl + ' Received: ' + curUrl);
  }

  await teardown(browser);
}

async function test6_sampleUserLogin() {
  const { browser, page } = await startup();
  const expectedUrl = baseUrl + 'LoginPage';

  // go to login page

  try {
    await clickOn(page, '#navbarResponsive > ul > li:nth-child(2) > a');
  } catch (err) {
    console.log('Could not find button');
    console.log(err.message);
  }


  try {
    await clickOn(page, '#email');
  } catch (err) {
    console.log('Could not find email entry box');
    console.log(err.message);
  }

  try {
    await typeIn(page, '#email', 'user2@wisc.edu');
  } catch (err) {
    console.log('Could not type into email entry box');
    console.log('err.message');
  }

  const curUrl = await page.url();
  if (curUrl !== expectedUrl) {
    console.log('Error on test 5: Current URL is not the login page');
    console.log('Expected: ' + expectedUrl + ' Received: ' + curUrl);
  }

  //await teardown(browser);
}

test1_homePageLoad();
test2_registerPageNav();
test3_aboutUsPageNav();
test4_aboutUsToHomePageNav();
test5_loginPageNav();
test6_sampleUserLogin();



// // basic login test
// (async () => {
//   // For our cases, we want to allow localhost, and use full chromium
//   const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: false});
//   const page = await browser.newPage();
//   await page.goto(baseUrl, {
//     waitUntil: 'networkidle2',
//   });
    
//   // go to login page
  
//   await page.click("#page-top > header > div > div.col-lg-8.mx-auto > a", {
//     waitUntil: 'networkidle2',
//   });

//   const beans = await page.url();
//   console.log(beans);
//   await browser.close();
// })();

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(baseUrl);

//   // Get the "viewport" of the page, as reported by the page.
//   const dimensions = await page.evaluate(() => {
//     return {
//       width: document.documentElement.clientWidth,
//       height: document.documentElement.clientHeight,
//       deviceScaleFactor: window.devicePixelRatio,
//     };
//   });

//   console.log('Dimensions:', dimensions);
//   await browser.close();
// })();


