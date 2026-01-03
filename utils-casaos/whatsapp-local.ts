import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import path from 'path';

let client: any = null;
let isReady = false;

export const initWhatsAppLocal = () => {
    console.log('[WhatsAppLocal] Initializing...');

    client = new Client({
        authStrategy: new LocalAuth({
            dataPath: path.join(process.cwd(), 'whatsapp-auth')
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', (qr: string) => {
        console.log('[WhatsAppLocal] QR Code received. Scan it below:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('[WhatsAppLocal] Client is ready! ✅');
        isReady = true;
    });

    client.on('authenticated', () => {
        console.log('[WhatsAppLocal] Authenticated! 🔓');
    });

    client.on('auth_failure', (msg: string) => {
        console.error('[WhatsAppLocal] Auth failure:', msg);
    });

    client.on('disconnected', (reason: string) => {
        console.log('[WhatsAppLocal] Client was logged out 🔴', reason);
        isReady = false;
    });

    client.initialize();
    return client;
};

export const sendLocalWhatsAppMessage = async (to: string, message: string) => {
    if (!client || !isReady) {
        console.warn('[WhatsAppLocal] Client not ready. Message skipped.');
        return false;
    }

    try {
        // Format phone number: remove +, add @c.us
        let formattedPhone = to.replace(/\D/g, '');
        if (!formattedPhone.endsWith('@c.us')) {
            formattedPhone += '@c.us';
        }

        await client.sendMessage(formattedPhone, message);
        console.log(`[WhatsAppLocal] Message sent to ${formattedPhone} ✅`);
        return true;
    } catch (error) {
        console.error('[WhatsAppLocal] Send error:', error);
        return false;
    }
};

export const getWhatsAppLocalStatus = () => isReady;
