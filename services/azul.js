const puppeteer = require('puppeteer');

// Config
const pageUrl = 'https://www.voeazul.com.br/';

module.exports = (req, res) => {
  const scrape = async () => {
    // Open browser
    const browser = await puppeteer.launch({ headless: false, slowMo: 110 });

    // Open incognito window
    const context = await browser.createIncognitoBrowserContext();

    // Open page
    const page = await context.newPage();
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });

    // Fill form
    await page.waitForSelector('.form-0001');

    await page.focus('#ticket-origin1');
    await page.keyboard.type(req.query.originCode);
    await page.keyboard.press('Tab');

    await page.focus('#ticket-destination1');
    await page.keyboard.type(req.query.destinationCode);
    await page.keyboard.press('Tab');

    await page.focus('#ticket-departure1');
    await page.keyboard.type(req.query.departureDate);
    await page.keyboard.press('Tab');

    await page.focus('#ticket-arrival1');
    await page.keyboard.type(req.query.arrivalDate);
    await page.keyboard.press('Enter');

    // Scrape rendered page
    await page.waitForNavigation({ waitUntil: 'load' });

    const data = await page.evaluate(() => {
      const flightListHandler = (id) => {
        const flightList = [];

        document.querySelector(id).querySelectorAll('.flight-item').forEach((flight) => {
          const flightInfo = flight.querySelector('.flight-details').querySelector('.detail').querySelector('.show-info');

          const info = {
            flightNumber: flightInfo.getAttribute('flightnumber').split(',')[0],
            flightSegments: flightInfo.getAttribute('flightnumber').split(',').length,
            flightNumbers: flightInfo.getAttribute('flightnumber'),
            departureTime: flightInfo.getAttribute('departuretime').split(','),
            arrivalTime: flightInfo.getAttribute('arrivaltime').split(','),
            duration: flightInfo.getAttribute('traveltime').padEnd(4, 0)
          };

          const prices = [];
          flight.querySelectorAll('.flight-price-container').forEach((price) => {
            prices.push({
              category: price.querySelector('.flight-tier').querySelector('img').getAttribute('alt').replace(/^(.*)\s+(.*)/g, '$2'),
              value: parseFloat(price.querySelector('input').getAttribute('fareprice'))
            });
          });

          flightList.push({
            ...info,
            prices,
          });
        });

        return flightList;
      };

      const expiresIn = document.querySelector('#az-time').innerText;
      const departureFlights = flightListHandler('#tbl-depart-flights');
      const arrivalFlights = flightListHandler('#tbl-return-flights');

      return {
        expiresIn,
        departureFlights,
        arrivalFlights,
      };
    });

    // Close incognito window
    await context.close();

    // Close browser
    await browser.close();

    return data;
  };

  scrape().then((data) => {
    res.json(data);
  });
};
