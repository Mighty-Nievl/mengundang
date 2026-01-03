const BASE_URL = 'https://undangan.zalan.web.id';
const SLUG = 'anu';

async function verify() {
    console.log(`Deep Verifying ${BASE_URL}/${SLUG}...`);
    try {
        const res = await fetch(`${BASE_URL}/${SLUG}`);
        const html = await res.text();

        console.log("HTML Status:", res.status);

        // 1. Check for data-theme attribute
        if (html.includes('data-theme="original"') || html.includes('data-theme=')) {
            console.log("✅ HTML Verification Passed: data-theme attribute found.");
        } else {
            console.error("❌ HTML Verification Failed: data-theme attribute NOT found.");
            // console.log("Partial HTML:", html.substring(0, 500));
        }

        // 2. Extract CSS Link
        const linkMatch = html.match(/<link[^>]+href="(\/_nuxt\/[^"]+\.css)"/);
        if (linkMatch && linkMatch[1]) {
            const cssPath = linkMatch[1];
            console.log("Found CSS Bundle:", cssPath);

            const cssRes = await fetch(`${BASE_URL}${cssPath}`);
            const css = await cssRes.text();

            // 3. Check for specific CSS Variables or Theme Selectors
            if (css.includes('--color-gold-500') && css.includes('[data-theme=midnight]')) {
                console.log("✅ CSS Verification Passed: Themes CSS found in bundle.");
            } else {
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
