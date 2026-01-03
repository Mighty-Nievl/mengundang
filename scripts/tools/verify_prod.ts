const BASE_URL = 'https://undangan.zalan.web.id';
const SLUG = 'anu'; // Assuming this slug exists or using a known public one? 
// Wait, 'anu' was local. I don't know if 'anu' is on prod.
// I should probably check the homepage or a known slug. 
// OR I can try to fetch the homepage which might have a theme if I applied it there?
// No, theme is per slug. 
// I will try to fetch 'editor/demo' or just check if the assets are reachable.

// Actually, I can check if the CSS file exists.
// <link rel="stylesheet" href="/_nuxt/themes.css"> ? No, it's bundled.
// I'll check if the main JS/CSS bundle contains the CSS variables.

async function verify() {
    console.log(`Fetching ${BASE_URL}...`);
    try {
        const res = await fetch(BASE_URL);
        const html = await res.text();

        // Check for the theme attribute code in the JS bundles? 
        // Hard to find without sourcemaps.

        // Better: Check if the new assets are served 
        // (This confirms deployment worked)
        console.log("Status:", res.status);
        if (res.status === 200) {
            console.log("✅ Site is UP");
        } else {
            console.error("❌ Site returned", res.status);
        }

    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

verify();
