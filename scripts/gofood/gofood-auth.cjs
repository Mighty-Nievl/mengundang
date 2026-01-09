const puppeteer = require('puppeteer');
const fs = require('fs');

const EMAIL = 'official.zalanstore@gmail.com';

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/home/nievl/.cache/puppeteer/chrome/linux-143.0.7499.169/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log("Navigating to portal.gofoodmerchant.co.id...");
        await page.goto('https://portal.gofoodmerchant.co.id/', { waitUntil: 'networkidle2', timeout: 90000 });

        // Helper to click visible button by text
        const clickButtonByText = async (textToMatch) => {
            return await page.evaluate(async (match) => {
                const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
                for (const btn of buttons) {
                    const style = window.getComputedStyle(btn);
                    if (style.display === 'none' || style.visibility === 'hidden') continue;
                    if (btn.innerText && btn.innerText.includes(match)) {
                        btn.click();
                        return true;
                    }
                }
                return false;
            }, textToMatch);
        };

        // 0. Handle Cookie Banner
        await clickButtonByText("Terima Semua Cookie");

        // 0.5 Handle Help Popup (Aggressive)
        const closePopup = async () => {
            await page.evaluate(() => {
                const closes = document.querySelectorAll('.reactour__close, [aria-label*="close"], [aria-label*="tutup"]');
                closes.forEach(el => el.click());
            });
        };
        await closePopup();

        console.log("Starting Login Flow...");

        // 1. Click "Masuk dengan email"
        const emailBtn = await page.$('#login-with-email-button');
        if (emailBtn) await page.evaluate(el => el.click(), emailBtn);
        else await clickButtonByText("Masuk dengan email");

        // 2. Input Email
        await page.waitForSelector('input[type="email"], input[type="text"]');
        const emailInput = await page.$('input[type="email"]') || await page.$('input[type="text"]');
        if (emailInput) {
            await page.evaluate((el, val) => {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, emailInput, EMAIL);
        }

        // 3. Click "Lanjut" (As per clear instruction)
        console.log("Clicking 'Lanjut'...");
        await new Promise(r => setTimeout(r, 1000));
        await page.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]');
            if (btn) btn.click();
        });

        // 4. Wait for Password Screen AND "Masuk dengan OTP" button
        console.log("Waiting for next screen...");
        await new Promise(r => setTimeout(r, 4000));
        await closePopup(); // Popup might show up here too

        // 5. Click "Masuk dengan OTP"
        console.log("Looking for 'Masuk dengan OTP'...");
        const clickedOtp = await clickButtonByText("Masuk dengan OTP");

        // CHECK FOR BLOCK MESSAGE HERE
        const checkBlockText = await page.evaluate(() => document.body.innerText);
        if (checkBlockText.includes("Anda telah diblok sementara")) {
            console.error("FATAL: Account is blocked.");
            await page.screenshot({ path: 'auth-blocked.png' });
            process.exit(1);
        }

        if (clickedOtp) {
            console.log("Clicked 'Masuk dengan OTP'.");
        } else {
            console.log("Could not find 'Masuk dengan OTP' button. Likely blocked or network issue.");
            await page.screenshot({ path: 'auth-debug-otp-btn.png' });
            process.exit(1); // Fail fast
        }

        // 6. Wait for OTP Input
        console.log("Waiting for OTP input field...");
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: 'otp-wait.png' });

        // Wait for user to provide OTP in otp.txt
        console.log("Waiting for otp.txt...");
        let otp = '';
        while (!otp) {
            if (fs.existsSync('otp.txt')) {
                otp = fs.readFileSync('otp.txt', 'utf8').trim();
                if (!otp) await new Promise(r => setTimeout(r, 1000));
            } else {
                await new Promise(r => setTimeout(r, 1000));
            }
        }
        console.log(`Received OTP: ${otp}`);

        // Try to identify the input
        const otpInput = await page.$('input[type="tel"]') || await page.$('input[type="number"]') || await page.$('input[autocomplete="one-time-code"]');

        if (otpInput) {
            console.log("Found OTP input. Debugging attributes...");
            await page.evaluate(el => {
                console.log('Input Attrs:', el.getAttributeNames().reduce((acc, name) => ({ ...acc, [name]: el.getAttribute(name) }), {}));
            }, otpInput);

            // Strategy 1: Click and Type
            await otpInput.click();
            await new Promise(r => setTimeout(r, 500));
            await page.keyboard.type(otp, { delay: 200 });

            // Validation
            let val = await page.evaluate(el => el.value, otpInput);
            console.log(`Value after typing: "${val}"`);

            if (!val) {
                console.log("Typing failed. Strategy 2: Direct Value Set + Events");
                await page.evaluate((el, code) => {
                    el.value = code;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    // Sometimes React needs native value setter hack
                    const prototype = Object.getPrototypeOf(el);
                    const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                    if (setter) {
                        setter.call(el, code);
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, otpInput, otp);

                val = await page.evaluate(el => el.value, otpInput);
                console.log(`Value after JS Set: "${val}"`);
            }
        } else {
            console.log("No specific OTP input found. Trying blind typing...");
            await page.keyboard.type(otp, { delay: 200 });
        }

        // Explicitly click "Masuk"
        console.log("Clicking 'Masuk'...");
        await new Promise(r => setTimeout(r, 1000));
        await page.evaluate(() => {
            // Look for the main submit button, likely the gray one that becomes active
            const buttons = Array.from(document.querySelectorAll('button'));
            for (const btn of buttons) {
                if (btn.innerText.includes('Masuk') && !btn.innerText.includes('password') && !btn.innerText.includes('OTP')) {
                    btn.disabled = false; // hack: force enable if needed
                    btn.click();
                    return;
                }
            }
            // Fallback: click any submit button
            const submit = document.querySelector('button[type="submit"]');
            if (submit) submit.click();
        });
        await new Promise(r => setTimeout(r, 5000));

        const currentUrl = page.url();
        const bodyText = await page.evaluate(() => document.body.innerText);

        // Strict Check: specific dashboard elements
        if (currentUrl.includes('dashboard') ||
            bodyText.includes('Ringkasan') ||
            bodyText.includes('Keluar') ||
            bodyText.includes('Logout')) {

            console.log("LOGIN SUCCESS: Dashboard reached.");
            await page.screenshot({ path: 'dashboard-check.png' });

            const cookies = await page.cookies();
            const localStorageData = await page.evaluate(() => {
                let json = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    json[key] = localStorage.getItem(key);
                }
                return json;
            });
            fs.writeFileSync('gofood-session.json', JSON.stringify({ cookies, localStorage: localStorageData }, null, 2));
            console.log("Session saved.");

        } else {
            console.error("LOGIN FAILED: Still on Login Page or OTP expired.");
            await page.screenshot({ path: 'auth-failed-otp-final.png' });
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
        if (fs.existsSync('otp.txt')) fs.unlinkSync('otp.txt');
    }
})();
