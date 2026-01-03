const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/home/nievl/.cache/puppeteer/chrome/linux-143.0.7499.169/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        console.log("Navigating to portal.gofoodmerchant.co.id...");
        await page.goto('https://portal.gofoodmerchant.co.id/', { waitUntil: 'networkidle2' });

        // 0. Handle Cookie Banner
        console.log("Checking for Cookie Banner...");
        try {
            await new Promise(r => setTimeout(r, 2000));
            const buttons = await page.$$('button');
            for (const btn of buttons) {
                const text = await page.evaluate(el => el.innerText, btn);
                if (text && text.includes("Terima Semua Cookie")) {
                    await btn.click();
                    console.log("Cookie Banner Accepted.");
                    break;
                }
            }
        } catch (e) {
            console.log("Error handling cookie banner: " + e.message);
        }

        // Wait for potential Help popup
        await new Promise(r => setTimeout(r, 5000));
        await page.screenshot({ path: 'debug-popup-check-2.png' });

        // Dump HTML to find the close button
        const html = await page.content();
        fs.writeFileSync('debug-popup.html', html);
        console.log("Dumped HTML to debug-popup.html");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
    }
})();
