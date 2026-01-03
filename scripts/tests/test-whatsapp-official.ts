// Test WhatsApp Cloud API (Official) - dengan pilihan nomor tujuan
import 'dotenv/config';

const CFG = {
    TOKEN: process.env.WHATSAPP_TOKEN || '',
    PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',
};

// Ambil nomor dari command line argument atau gunakan default
const TARGET_PHONE = process.argv[2] || '6285792441446';

async function testWhatsAppOfficial() {
    console.log("========================================");
    console.log("🧪 Testing WhatsApp Official API (Meta Cloud API)");
    console.log("========================================\n");

    console.log("📋 Configuration:");
    console.log(`   Phone ID: ${CFG.PHONE_ID}`);
    console.log(`   Target Phone: ${TARGET_PHONE}`);
    console.log(`   Token: ${CFG.TOKEN ? CFG.TOKEN.substring(0, 20) + '...' : 'NOT SET'}`);
    console.log("");

    // Cek Phone Number ID details
    console.log("🔍 Checking Phone Number details...\n");
    try {
        const infoUrl = `https://graph.facebook.com/v21.0/${CFG.PHONE_ID}`;
        const infoRes = await fetch(infoUrl, {
            headers: { 'Authorization': `Bearer ${CFG.TOKEN}` }
        });
        const infoData = await infoRes.json();
        console.log("📱 Phone Info:", JSON.stringify(infoData, null, 2), "\n");
    } catch (e) { }

    if (!CFG.TOKEN || !CFG.PHONE_ID) {
        console.error("❌ Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID in .env");
        return;
    }

    const message = `🧪 *Test WhatsApp Official API*\n\nIni pesan test dari Zalan Store pada:\n📅 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n✅ Meta Cloud API berhasil terkoneksi!`;

    console.log("📤 Sending test message...\n");

    try {
        const url = `https://graph.facebook.com/v21.0/${CFG.PHONE_ID}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            to: TARGET_PHONE,
            type: "text",
            text: { body: message }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CFG.TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log("📥 API Response:");
        console.log(JSON.stringify(data, null, 2));
        console.log("");

        if (response.ok) {
            console.log("✅ SUCCESS! Pesan berhasil dikirim via WhatsApp Official API");
            console.log(`   Message ID: ${data.messages?.[0]?.id || 'N/A'}`);
        } else {
            console.error("❌ FAILED! API Error:", data.error?.message || 'Unknown error');

            // Berikan saran berdasarkan error code
            if (data.error?.code === 132000) {
                console.log("\n💡 Saran: Nomor tujuan perlu ditambahkan ke Test Recipients di Meta Developer Console");
            } else if (data.error?.code === 133010) {
                console.log("\n💡 Saran: Pastikan nomor tujuan terdaftar di WhatsApp dan formatnya benar (6281234567890)");
            } else if (data.error?.code === 190) {
                console.log("\n💡 Saran: Token sudah expired. Generate token baru di Meta Developer Console");
            }
        }

    } catch (error) {
        console.error("❌ Network Error:", error);
    }

    console.log("\n========================================");
}

testWhatsAppOfficial();
