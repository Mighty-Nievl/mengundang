const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // 1. Load Session
    if (!fs.existsSync('gofood-session.json')) {
        process.exit(1);
    }
    const session = JSON.parse(fs.readFileSync('gofood-session.json', 'utf8'));

    // 2. Launch Browser
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/home/nievl/.cache/puppeteer/chrome/linux-143.0.7499.169/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        // 3. Restore Session
        if (session.cookies) await page.setCookie(...session.cookies);
        if (session.localStorage) {
            await page.evaluateOnNewDocument((data) => {
                for (const key in data) localStorage.setItem(key, data[key]);
            }, session.localStorage);
        }

        await page.goto('https://portal.gofoodmerchant.co.id/transactions', { waitUntil: 'networkidle2' });

        // Skip nav logic for brevity, just dump whatever we landed on
        // Wait a bit
        await new Promise(r => setTimeout(r, 5000));

        const html = await page.content();
        fs.writeFileSync('gofood-dump.html', html);
        console.log("Dumped HTML to gofood-dump.html");

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
