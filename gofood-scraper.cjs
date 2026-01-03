const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // 1. Load Session
    if (!fs.existsSync('gofood-session.json')) {
        console.error("Session file not found! Run auth script first.");
        process.exit(1);
    }
    const session = JSON.parse(fs.readFileSync('gofood-session.json', 'utf8'));

    // 2. Launch Browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process',
            '--disable-extensions',
            '--window-size=1280,800'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Helper to click visible button by text
    const clickButtonByText = async (textToMatch) => {
        return await page.evaluate(async (match) => {
            const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
            for (const btn of buttons) {
                const style = window.getComputedStyle(btn);
                if (style.display === 'none' || style.visibility === 'hidden') continue;

                if (btn.innerText && btn.innerText.toLowerCase().includes(match.toLowerCase())) {
                    btn.scrollIntoView(); // Ensure it's in view
                    btn.click();
                    return true;
                }
            }
            return false;
        }, textToMatch);
    };

    try {
        // 4. Navigate to Transactions (via URL fallback if needed)


        // 3. Restore Session
        if (session.cookies) {
            await page.setCookie(...session.cookies);
        }
        if (session.localStorage) {
            await page.evaluateOnNewDocument((data) => {
                for (const key in data) {
                    localStorage.setItem(key, data[key]);
                }
            }, session.localStorage);
        }

        console.log("Session restored. Navigating to Dashboard...");

        // 1. Go to Dashboard first (more natural)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto('https://portal.gofoodmerchant.co.id/', { waitUntil: 'networkidle2' });

        // Handle "Tunggu sebentar" with reload retry
        console.log("Waiting for initial load...");
        try {
            await page.waitForFunction(() => !document.body.innerText.includes('Tunggu sebentar'), { timeout: 10000 });
        } catch (e) {
            console.log("Spinner stuck. Reloading page...");
            await page.reload({ waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 5000));
        }

        // Handle "Eksplor tampilan baru" Popup (Main Dashboard)
        try {
            const popup = await page.waitForSelector('button', { timeout: 5000 });
            if (popup) await clickButtonByText("Lewati");
        } catch (e) { }

        // 2. Navigate to Transactions via UI
        console.log("Navigating to Transactions...");

        // Expand 'Keuangan' if needed
        const financeBtn = await clickButtonByText("Keuangan");
        if (financeBtn) await new Promise(r => setTimeout(r, 1000));

        // Click 'Transaksi'
        const transBtn = await clickButtonByText("Transaksi");
        if (!transBtn) {
            console.log("Menu click failed, forcing URL navigation...");
            await page.goto('https://portal.gofoodmerchant.co.id/transactions', { waitUntil: 'networkidle2' });
        }

        // Handle "Tunggu sebentar" AGAIN on Transactions page
        try {
            await page.waitForFunction(() => !document.body.innerText.includes('Tunggu sebentar'), { timeout: 10000 });
        } catch (e) {
            console.log("Spinner stuck on Transactions. Reloading...");
            await page.reload({ waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 5000));
        }

        // Handle Cookie Banner (Main Page)
        await clickButtonByText("Terima Semua Cookie");

        // Handle "Eksplor tampilan baru" Popup
        console.log("Checking for 'Eksplor tampilan baru' popup...");
        try {
            await page.waitForSelector('button', { timeout: 5000 });
            const popupHandled = await clickButtonByText("Lewati");
            if (popupHandled) {
                console.log("Clicked 'Lewati' on popup.");
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (e) { }

        console.log("Page loaded: " + await page.title());

        // Wait for Loading Spinner to disappear
        console.log("Waiting for loading to finish...");
        try {
            await page.waitForFunction(() => !document.body.innerText.includes('Tunggu sebentar'), { timeout: 15000 });
            console.log("Loading finished.");
        } catch (e) {
            console.log("Timed out waiting for loader, continuing anyway...");
        }

        // 4.5 Change Date Filter (to ensure we see data)
        console.log("Adjusting Date Filter...");
        const dateDropdown = await clickButtonByText("Hari Ini");
        if (dateDropdown) {
            console.log("Clicked Date Dropdown.");
            await new Promise(r => setTimeout(r, 1000));

            // Try to click "7 Hari Terakhir" or similar
            const last7Days = await clickButtonByText("7 Hari Terakhir") || await clickButtonByText("7 hari terakhir") || await clickButtonByText("Minggu Ini");

            if (last7Days) {
                console.log("Selected 7 Days range.");
                await new Promise(r => setTimeout(r, 1000));
                await clickButtonByText("Terapkan") || await clickButtonByText("Terapkan filter");
                await new Promise(r => setTimeout(r, 3000)); // Wait for reload
            } else {
                console.log("Could not find '7 Hari Terakhir' option.");
            }
        }

        // 5. Select "GoPay" Tab (if applicable)
        console.log("Looking for GoPay tab...");
        try {
            await page.waitForSelector('div[role="tablist"], nav, ul', { timeout: 5000 });
        } catch (e) { }

        const clicked = await page.evaluate(async () => {
            const elements = Array.from(document.querySelectorAll('div, span, p, a, button'));
            for (const el of elements) {
                if (el.innerText && el.innerText.trim() === 'GoPay') {
                    el.click();
                    return true;
                }
            }
            return false;
        });

        if (clicked) {
            console.log("Clicked GoPay tab");
            await new Promise(r => setTimeout(r, 4000));

            // Handle Privacy Notice / Cookie Banner inside GoPay tab
            console.log("Attacking Privacy/Cookie Notice...");
            await page.screenshot({ path: 'scraper-gopay-check.png' });

            // SCROLL DOWN to reveal button
            console.log("Scrolling down...");
            // Try scrolling the window
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            // Try scrolling any large text containers
            await page.evaluate(() => {
                const divs = document.querySelectorAll('div');
                for (const div of divs) {
                    if (div.scrollHeight > div.clientHeight) {
                        div.scrollTop = div.scrollHeight;
                    }
                }
            });

            await new Promise(r => setTimeout(r, 1000));
            await page.screenshot({ path: 'scraper-gopay-scrolled.png' });

            // Strategy 1: Click Buttons
            let handled = false;
            if (await clickButtonByText("Terima Semua")) handled = true;
            else if (await clickButtonByText("Saya Setuju")) handled = true;
            else if (await clickButtonByText("Lanjut")) handled = true;
            else if (await clickButtonByText("Lewati")) handled = true; // Just in case

            if (handled) console.log("Clicked a privacy/popup button.");

            await new Promise(r => setTimeout(r, 2000));

            // Strategy 2: Nuke the Modal if still present
            const nuked = await page.evaluate(() => {
                const textNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                let currentNode;
                while (currentNode = textNodes.nextNode()) {
                    if (currentNode.nodeValue.includes("Pemberitahuan Privasi GoPay")) {
                        // Find the modal container
                        let el = currentNode.parentElement;
                        while (el && el !== document.body) {
                            const style = window.getComputedStyle(el);
                            if (style.position === 'fixed' || style.position === 'absolute' || style.zIndex > 100) {
                                el.remove(); // REMOVE IT completely
                                return "Removed modal from DOM";
                            }
                            el = el.parentElement;
                        }
                    }
                }
                return false;
            });

            if (nuked) console.log(`Nuclear option used: ${nuked}`);

            await new Promise(r => setTimeout(r, 3000)); // Wait for data load
        } else {
            console.log("GoPay tab not found or already active?");
        }

        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: 'scraper-data.png' });

        // 5. Navigate to Transactions
        console.log("Navigating to Transactions...");

        // Setup Network Interception
        const capturedTransactions = [];
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('journals/search')) {
                const headers = response.headers();
                const contentType = headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    try {
                        const json = await response.json();
                        // Check if hits exist
                        if (json.hits && Array.isArray(json.hits)) {
                            console.log(`[Network] Captured ${json.hits.length} transactions from API.`);
                            json.hits.forEach(hit => {
                                // Extract Data safely
                                try {
                                    const meta = hit.metadata || {};
                                    const transaction = meta.transaction || {};
                                    const providerMeta = meta.provider_metadata?.aspi?.data || {};
                                    const refMeta = meta.provider_metadata?.metadata || {};

                                    const amount = providerMeta.amount || transaction.real_gross_amount || 0;
                                    const refId = refMeta.retrieval_reference_number || "";
                                    const status = hit.status || "submited";
                                    const date = hit.time || new Date().toISOString();
                                    const description = transaction.order_id || "";

                                    // Normalize Amount (If it's 100000 for 1000, we might need div by 100, but aspi.data.amount seems correct at 1000)
                                    // Debug log to be sure
                                    // console.log(`[Debug] Amount: ${amount}, Ref: ${refId}`);

                                    capturedTransactions.push({
                                        date,
                                        description,
                                        amount: amount.toString(),
                                        status: status === 'success' ? 'Settlement' : status, // Map 'success' to 'Settlement' to match existing logic if needed
                                        ref_id: refId
                                    });
                                } catch (err) {
                                    console.error("Error parsing hit:", err);
                                }
                            });
                        }
                    } catch (e) {
                        // ignore invalid json or parsing errors
                    }
                }
            }
        });

        await page.goto('https://portal.gofoodmerchant.co.id/transactions?date_range=today', { waitUntil: 'networkidle2' });

        // Wait a bit to ensure all API calls finish
        console.log("Waiting for API responses...");
        await new Promise(r => setTimeout(r, 6000));

        console.log("---JSON_START---");
        // Remove duplicates based on Ref ID (if any)
        const uniqueTx = Array.from(new Map(capturedTransactions.map(item => [item.ref_id, item])).values());
        console.log(JSON.stringify(uniqueTx, null, 2));
        console.log("---JSON_END---");

        // DOM Scraping skipped in favor of Network Interception

        // Click the first data row (index 1 usually, 0 is header)
        try {
            const rows = await page.$$('tr');
            if (rows.length > 1) {
                console.log("Clicking first row to reveal details...");
                await rows[1].click();

                // Wait for potential modal or side panel
                await new Promise(r => setTimeout(r, 4000));

                await page.screenshot({ path: 'transaction-details.png', fullPage: true });
                const detailsText = await page.evaluate(() => document.body.innerText);

                console.log("---DETAILS_TEXT_START---");
                console.log(detailsText);
                console.log("---DETAILS_TEXT_END---");
            }
        } catch (err) {
            console.error("Failed to click details:", err);
        }

        console.log("---FULL_TEXT_START---");
        console.log("Details clicked for debugging.");
        console.log("---FULL_TEXT_END---");

        // Save fresh session if we survived
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

    } catch (e) {
        console.error("Error:", e);
        await page.screenshot({ path: 'scraper-error.png' });
    } finally {
        await browser.close();
    }
})();
