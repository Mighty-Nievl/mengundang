import { sendWhatsAppNotification } from './server/utils/whatsapp';

async function test() {
    console.log("--- Testing WhatsApp Routing ---");

    const target = process.env.WHATSAPP_TARGET_PHONE || '6285946001116';

    console.log("\n1. Testing VVIP (Should go Official + Local if Admin)");
    await sendWhatsAppNotification("🔔 Test VVIP: Routing check", target, 'vvip');

    console.log("\n2. Testing Regular (Should go Local only)");
    await sendWhatsAppNotification("🔔 Test Regular: Routing check", target, 'regular');

    console.log("\n3. Testing Admin (Should go Both)");
    await sendWhatsAppNotification("🔔 Test Admin: Routing check", target, 'admin');
}

test();
