const puppeteer = require('puppeteer');

let scrape = async () => {
    // Open browser
    const browser = await puppeteer.launch({ headless: false, slowMo: 110 });

    // Open incognito window
    const context = await browser.createIncognitoBrowserContext();

    // Open page
    const page = await context.newPage();
    await page.goto('https://www.voeazul.com.br/', { waitUntil: 'networkidle2' });

    // Fill form
    await page.waitForSelector('.form-0001');

    await page.focus('#ticket-origin1');
    await page.keyboard.type('FLN');
    await page.keyboard.press('Tab');

    await page.focus('#ticket-destination1');
    await page.keyboard.type('CNF');
    await page.keyboard.press('Tab');

    await page.focus('#ticket-departure1');
    await page.keyboard.type('15022019');
    await page.keyboard.press('Tab');

    await page.focus('#ticket-arrival1');
    await page.keyboard.type('17022019');
    await page.keyboard.press('Enter');

    // Scrape rendered page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const expiresIn = document.querySelector('#az-time').innerText; // eslint-disable-line no-undef

        return {
            expiresIn
        };
    });

    // Close incognito window
    await context.close();

    // Close browser
    await browser.close();

    return data;
};

scrape().then((data) => {
    console.log(data);
});