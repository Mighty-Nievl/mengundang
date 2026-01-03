const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/home/nievl/.cache/puppeteer/chrome/linux-143.0.7499.169/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://portal.gofoodmerchant.co.id/', { waitUntil: 'networkidle2' });

    const html = await page.content();
    fs.writeFileSync('login-page.html', html);

    await browser.close();
})();
