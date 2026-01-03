
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

if (!TOKEN || !PHONE_ID) {
    console.error("Missing .env credentials");
    process.exit(1);
}

const url = `https://graph.facebook.com/v21.0/${PHONE_ID}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type,throughput,account_mode`;

console.log(`Auditing Phone ID: ${PHONE_ID}...`);

try {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        }
    });

    const data = await response.json();
    console.log("--- Account Health Audit ---");
    console.log(JSON.stringify(data, null, 2));

    if (data.error) {
        console.error("Audit Failed:", data.error.message);
    }
} catch (error) {
    console.error("Network Error:", error);
}
