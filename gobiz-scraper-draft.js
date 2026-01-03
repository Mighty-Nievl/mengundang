const puppeteer = require('puppeteer');

(async () => {
    // 1. Launch Browser
    // Di local laptop, set headless: false biar bisa lihat loginnya
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    try {
        console.log("Navigating to GoBiz Dashboard...");
        // 2. Buka GoBiz
        await page.goto('https://dashboard.gobiz.co.id/', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log("Page loaded. Please Login manually!");

        // 3. User Login Manual (Input No HP -> OTP)
        // Script akan menunggu sampai user berhasil masuk ke dashboard
        // Kita mendeteksi elemen dashboard, misal sidebar menu
        await page.waitForSelector('a[href="/transactions"]', { timeout: 0 }); // Tunggu selamanya sampai login

        console.log("Login Success!");

        // 4. Save Session (Cookies & LocalStorage)
        // Ini nantinya disimpan ke file JSON biar run berikutnya gak perlu OTP lagi
        const cookies = await page.cookies();
        const localStorageData = await page.evaluate(() => {
            let json = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                json[key] = localStorage.getItem(key);
            }
            return json;
        });

        const sessionData = {
            cookies,
            localStorage: localStorageData
        };

        console.log("Session saved! (Simpan ini ke file JSON)");
        console.log(JSON.stringify(sessionData, null, 2));

        // 5. Go to Transactions
        await page.goto('https://dashboard.gobiz.co.id/transactions', { waitUntil: 'networkidle0' });

        // 6. Scrape Data
        // Contoh ambil data transaksi terakhir
        const transactions = await page.evaluate(() => {
            const rows = document.querySelectorAll('tr'); // Sesuaikan selector tabel
            return Array.from(rows).map(row => row.innerText);
        });

        console.log("Data Transaksi:", transactions);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        // await browser.close();
    }
})();
