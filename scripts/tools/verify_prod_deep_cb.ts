const BASE_URL = 'https://undangan.zalan.web.id';
const SLUG = 'anu';
// Use a unique cache buster
const CB = Date.now();

async function verify() {
    console.log(`Deep Verifying with Cache Buster ${BASE_URL}/${SLUG}?v=${CB}...`);
    try {
        const res = await fetch(`${BASE_URL}/${SLUG}?v=${CB}`);
        const html = await res.text();

        console.log("HTML Status:", res.status);

        // 1. Check for data-theme attribute
        if (html.includes('data-theme="original"') || html.includes('data-theme=')) {
            console.log("✅ HTML Verification Passed: data-theme attribute found.");
        } else {
            console.error("❌ HTML Verification Failed: data-theme attribute NOT found.");
        }

        // 1.5 Check for INLINE CSS Variables
        if (html.includes('--color-gold-500')) {
            console.log("✅ HTML Verification Passed: Inline CSS Variables found in HTML.");
        } else {
            console.log("ℹ️ Inline CSS Variables NOT found in HTML (checking linked CSS next...)");
        }

        // 2. Extract CSS Link
        const linkMatch = html.match(/<link[^>]+href="(\/_nuxt\/[^"]+\.css)"/);
        if (linkMatch && linkMatch[1]) {
            const cssPath = linkMatch[1];
            console.log("Found CSS Bundle:", cssPath);

            // Fetch CSS with cache buster too just in case
            const cssRes = await fetch(`${BASE_URL}${cssPath}?v=${CB}`);
            const css = await cssRes.text();

            // 3. Check for specific CSS Variables or Theme Selectors
            if (css.includes('--color-gold-500') && css.includes('[data-theme=midnight]')) {
                console.log("✅ CSS Verification Passed: Themes CSS found in bundle.");
            } else {
                console.log("First 1000 chars of CSS:", css.substring(0, 1000));
                console.error("❌ CSS Verification Failed: Theme definitions NOT found.");
            }
        } else {
            console.error("❌ CSS Verification Failed: Could not find main CSS link.");
        }

    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

verify();
