
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
    try {
        console.log('Starting visual verification...');

        // Launch headless browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Emulate iPhone X for mobile responsiveness check
        await page.setViewport({ width: 375, height: 812 });

        console.log('Navigating to http://localhost:3001/demo ...');
        await page.goto('http://localhost:3001/demo', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        console.log('Page loaded. Capturing initial state...');
        await page.screenshot({ path: join(__dirname, '1-initial-cover.png') });

        // Debug: Log text content to see if loading
        const bodyText = await page.$eval('body', el => el.innerText);
        console.log('Body Text Snippet:', bodyText.substring(0, 200));

        // Find and Click Button
        const btnSelector = '.cover-section button';
        try {
            await page.waitForSelector(btnSelector, { timeout: 5000 });
        } catch (e) {
            console.error('Timeout waiting for selector. Page state might be "Loading..."');
        }

        const btn = await page.$(btnSelector);

        if (!btn) {
            throw new Error(`Button selector "${btnSelector}" not found based on HTML content.`);
        }

        console.log('Clicking "Buka Undangan" button...');
        await btn.click();

        // Capture Animation Sequence
        // T+0ms: Clicked
        console.log('Action triggered. capturing sequence...');

        // 200ms: Should be "Preparing" or Starting to reveal
        await new Promise(r => setTimeout(r, 200));
        await page.screenshot({ path: join(__dirname, '2-animation-start-200ms.png') });
        console.log('Captured 200ms frame.');

        // 800ms: Should be fading in
        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({ path: join(__dirname, '3-animation-mid-800ms.png') });
        console.log('Captured 800ms frame.');

        // 2000ms: Should be fully visible
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: join(__dirname, '4-animation-end-2000ms.png') });
        console.log('Captured 2000ms frame.');

        // Verify CSS Class State
        const finalClass = await page.$eval('.reveal-on-scroll', el => el.className);
        console.log('Final Class List:', finalClass);

        await browser.close();
        console.log('✅ Visual Verification Completed.');

    } catch (e) {
        console.error('❌ Error during verification:', e);
        process.exit(1);
    }
})();
