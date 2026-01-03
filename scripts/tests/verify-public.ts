
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
    try {
        console.log('Starting PUBLIC visual verification...');

        // Launch headless browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Emulate User Agent to bypass basic Cloudflare Bot Checks
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 375, height: 812 });

        console.log('Navigating to https://undangan.zalan.web.id/demo ...');
        await page.goto('https://undangan.zalan.web.id/demo', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        console.log('Page loaded?? Checking title...');
        const title = await page.title();
        console.log('Page Title:', title);

        // Check if we hit Cloudflare Error
        const bodyText = await page.$eval('body', el => el.innerText);
        if (bodyText.includes('Cloudflare Tunnel error')) {
            throw new Error('Hit Cloudflare Loopback Error 1033/1000');
        }

        console.log('Capturing PUBLIC state...');
        await page.screenshot({ path: join(__dirname, 'public-cover.png') });

        // Find and Click Button
        const btnSelector = '.cover-section button';
        try {
            await page.waitForSelector(btnSelector, { timeout: 5000 });
        } catch (e) {
            console.error('Button not found. Potentially blocked or loading error.');
            console.log('Body dump:', bodyText.substring(0, 500));
            throw e;
        }

        console.log('Clicking "Buka Undangan" button...');
        await page.click(btnSelector);

        // Wait for GSAP Cover Animation (1.5s) + Fade Up Delay
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: join(__dirname, 'public-revealed.png') });
        console.log('Captured PUBLIC revealed frame.');

        // FORCE UNLOCK SCROLL (NUCLEAR OPTION) - Still needed to allow us to peek at the bottom
        await page.evaluate(() => {
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';

            const appDiv = document.querySelector('#__nuxt > div > div') as HTMLElement;
            if (appDiv) {
                appDiv.classList.remove('overflow-hidden', 'h-screen');
                appDiv.style.overflow = 'visible';
                appDiv.style.height = 'auto';
            }
        });

        // AUTO-FLOW VERIFICATION
        console.log('Waiting 3 seconds for Auto-Flow to complete...');
        await new Promise(r => setTimeout(r, 3000));

        // Jump to bottom to see if it's already visible
        await page.evaluate(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
        });

        const footerClass = await page.$eval('.text-center.text-xs', el => el.className).catch(() => 'NOT_FOUND');
        console.log(`[Auto-Flow Check] Footer Class: ${footerClass}`);

        await page.screenshot({ path: join(__dirname, 'public-autoflow-proof.png') });
        console.log('Captured Auto-Flow proof.');

        // Sanity Check: All reveal-on-scroll elements should handle is-visible
        const hiddenCount = await page.evaluate(() => {
            return document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').length;
        });
        console.log(`Remaining Hidden Elements: ${hiddenCount}`);

        await browser.close();
        console.log('✅ PUBLIC Visual Verification Completed.');

    } catch (e: any) {
        console.error('❌ Error during PUBLIC verification:', e.message);
        process.exit(1);
    }
})();
