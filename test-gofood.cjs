const puppeteer = require('puppeteer');

(async () => {
    // Gunakan path Chrome yang sudah kita temukan sebelumnya
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/home/nievl/.cache/puppeteer/chrome/linux-143.0.7499.169/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        console.log("Navigating to https://portal.gofoodmerchant.co.id/...");
        await page.goto('https://portal.gofoodmerchant.co.id/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const title = await page.title();
        console.log("Page Title:", title);

        // Screenshot buat bukti ke user
        await page.screenshot({ path: 'gofood_test.png' });
        console.log("Screenshot saved to gofood_test.png");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
    }
})();
