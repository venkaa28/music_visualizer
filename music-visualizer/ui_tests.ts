const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ignoreHTTPSErrors: true});
    const page = await browser.newPage();
    await page.goto('https://localhost:4200', {
      waitUntil: 'networkidle2',
    });
    await page.pdf({ path: 'hn.pdf', format: 'a4' });
    await browser.close();
  })();
