// Test WhatsApp Local Bot - Generate QR Code
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import path from 'path';

console.log('========================================');
console.log('🤖 WhatsApp Local Bot (whatsapp-web.js)');
console.log('========================================\n');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(process.cwd(), 'whatsapp-auth')
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-accelerated-2d-canvas'
        ]
    }
});

client.on('qr', (qr: string) => {
    console.log('📱 QR Code received! Scan dengan HP:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n⏳ Menunggu scan...');
});

client.on('loading_screen', (percent: number, message: string) => {
    console.log(`⏳ Loading: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
    console.log('🔓 Authenticated!');
});

client.on('auth_failure', (msg: string) => {
    console.error('❌ Auth failure:', msg);
});

client.on('ready', async () => {
    console.log('\n✅ WhatsApp Bot READY!');
    console.log('========================================\n');

    const info = client.info;
    console.log('📋 Bot Info:');
    console.log(`   Name: ${info.pushname}`);
    console.log(`   Number: ${info.wid.user}`);
    console.log(`   Platform: ${info.platform}`);

    // Send test message to self
    const myNumber = info.wid._serialized;
    console.log('\n📤 Sending test message to self...');

    try {
        await client.sendMessage(myNumber, '✅ WhatsApp Local Bot berhasil terkoneksi!\n\n📅 ' + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
        console.log('✅ Test message sent!');
    } catch (e) {
        console.log('⚠️ Could not send test message:', e);
    }

    console.log('\n🎉 Bot aktif! Tekan Ctrl+C untuk stop.');
});

client.on('disconnected', (reason: string) => {
    console.log('🔴 Disconnected:', reason);
    process.exit(1);
});

console.log('🚀 Initializing bot...');
console.log('⏳ Puppeteer starting (may take 30-60s)...\n');

client.initialize();
