// WhatsApp Bot using Baileys (No Puppeteer!)
// Deploy this to Katabump server

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

// ============ CONFIGURATION ============
const API_BASE_URL = 'https://mengundang.site';
const API_SECRET = process.env.INTERNAL_API_SECRET || 'YOUR_SECRET_HERE';
const POLL_INTERVAL = 10000; // 10 seconds

let sock = null;
let isReady = false;

// ============ START WHATSAPP ============
async function startWhatsApp() {
    console.log('\n🚀 Starting WhatsApp Bot (Baileys)...');
    console.log('================================================\n');

    // Load auth state
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    // Create socket (without deprecated option)
    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    // Connection updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Handle QR code manually
        if (qr) {
            console.log('\n========================================');
            console.log('📱 SCAN QR CODE BELOW WITH WHATSAPP:');
            console.log('========================================\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log('🔴 Connection closed. Status:', statusCode, '| Reconnecting:', shouldReconnect);
            isReady = false;

            if (shouldReconnect) {
                setTimeout(startWhatsApp, 5000);
            } else {
                console.log('❌ Logged out. Please delete auth_info folder and restart.');
            }
        } else if (connection === 'open') {
            console.log('\n✅ WhatsApp Connected!');
            console.log('📡 Starting message polling...\n');
            isReady = true;
            startPolling();
        }
    });
}

// ============ API FUNCTIONS ============
async function fetchPendingMessages() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/internal/notifications/poll`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-secret': API_SECRET
            }
        });
        const data = await res.json();
        return data.success ? data.data : [];
    } catch (e) {
        console.error('[Poll] Error:', e.message);
        return [];
    }
}

async function confirmSentMessages(ids) {
    try {
        await fetch(`${API_BASE_URL}/api/internal/notifications/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-secret': API_SECRET
            },
            body: JSON.stringify({ ids })
        });
        console.log(`[Confirm] ✅ Marked ${ids.length} messages as sent`);
    } catch (e) {
        console.error('[Confirm] Error:', e.message);
    }
}

// ============ SEND MESSAGE ============
async function sendMessage(phone, message) {
    if (!isReady || !sock) {
        console.log('[Send] Bot not ready, skipping...');
        return false;
    }

    try {
        // Format: 628xxx -> 628xxx@s.whatsapp.net
        let jid = phone.replace(/\D/g, '');
        if (!jid.includes('@')) {
            jid = jid + '@s.whatsapp.net';
        }

        await sock.sendMessage(jid, { text: message });
        console.log(`✅ Sent to ${phone}`);
        return true;
    } catch (e) {
        console.error(`❌ Failed to send to ${phone}:`, e.message);
        return false;
    }
}

// ============ POLLING LOOP ============
let pollingInterval = null;

async function pollAndSend() {
    if (!isReady) return;

    const messages = await fetchPendingMessages();
    if (messages.length === 0) return;

    console.log(`\n📨 Processing ${messages.length} pending messages...`);

    const sentIds = [];
    for (const msg of messages) {
        const success = await sendMessage(msg.phoneNumber, msg.message);
        if (success) {
            sentIds.push(msg.id);
        }
        // Delay between messages
        await new Promise(r => setTimeout(r, 2000));
    }

    if (sentIds.length > 0) {
        await confirmSentMessages(sentIds);
    }
}

function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);

    console.log(`🔄 Polling every ${POLL_INTERVAL / 1000} seconds...`);
    pollingInterval = setInterval(pollAndSend, POLL_INTERVAL);
    pollAndSend(); // Initial poll
}

// ============ START ============
startWhatsApp();
