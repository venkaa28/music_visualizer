const puppeteer = require('puppeteer');


// basic login test
(async () => {
  // For our cases, we want to allow localhost, and use full chromium
  const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: false});
  const page = await browser.newPage();
  await page.goto('https://localhost:4200', {
    waitUntil: 'networkidle2',
  });
    
  // go to login page
  
  await page.click("#page-top > header > div > div.col-lg-8.mx-auto > a", {
    waitUntil: 'networkidle2',
  });

  const beans = await page.url();
  console.log(beans);
  await browser.close();
})();

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');

  // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio,
    };
  });

  console.log('Dimensions:', dimensions);
  await browser.close();
})();


