
const TOKEN = process.env.WHATSAPP_TOKEN;
// WABA ID (Probing the Asset ID from user URL)
const WABA_ID = "4076484562613676";

if (!TOKEN) {
    console.error("Missing WHATSAPP_TOKEN in .env");
    process.exit(1);
}

const url = `https://graph.facebook.com/v21.0/${WABA_ID}/phone_numbers?fields=id,display_phone_number,verified_name,status`;

console.log(`Fetching Phone Numbers for WABA ID: ${WABA_ID}...`);

try {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        }
    });

    const data = await response.json();
    console.log("--- Phone Numbers List ---");
    console.log(JSON.stringify(data, null, 2));

    if (data.error) {
        console.error("Fetch Failed:", data.error.message);
    }
} catch (error) {
    console.error("Network Error:", error);
}
