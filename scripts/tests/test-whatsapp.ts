


import { sendWhatsAppMessage } from './server/utils/whatsapp-cloud';

console.log("Testing WhatsApp Cloud API (Text Mode)...");

async function main() {
    console.log("Sending test message...");
    const success = await sendWhatsAppMessage("🔔 Sistem Zalan Invitation: Tes Notifikasi ke Nomor Baru Berhasil! ✅");

    if (success) {
        console.log("✅ Message accepted by Meta.");
    } else {
        console.error("❌ Failed to send message.");
    }
}

main();
