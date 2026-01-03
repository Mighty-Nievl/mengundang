import cron from 'node-cron'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// --- CONFIGURATION ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!
const API_BASE_URL = process.env.API_BASE_URL || 'https://undangan.zalan.web.id'
const API_SECRET = process.env.INTERNAL_API_SECRET!

const POLL_INTERVAL = 1000 // 1 second
const CRON_SCHEDULE = '*/5 * * * *' // Every 5 minutes

let lastUpdateId = 0
let isSchedulerRunning = false

// --- API CLIENT ---
async function callApi(endpoint: string, method: string = 'GET', body?: any) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/internal/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-secret': API_SECRET
            },
            body: body ? JSON.stringify(body) : undefined
        })
        return await res.json()
    } catch (e) {
        console.error(`[API] Failed to call ${endpoint}:`, e)
        return null
    }
}

// --- TELEGRAM HELPERS ---
async function sendMessage(text: string, options: any = {}) {
    const payload = {
        chat_id: options.chat_id || CHAT_ID,
        text,
        parse_mode: 'Markdown',
        ...options
    }
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    return res.json()
}

async function editMessage(chatId: number, messageId: number, text: string, options: any = {}) {
    const payload = {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        ...options
    }
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
}

async function answerCallback(callbackId: string) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackId })
    })
}

// --- BOT LOGIC ---
async function sendMainMenu(chatId: number, messageId?: number) {
    const text = `🤖 *CasaOS Remote Admin*\n\nStatus: Online 🟢\nConnected to: ${API_BASE_URL}`
    const keyboard = {
        inline_keyboard: [
            [
                { text: '📊 Live Stats', callback_data: 'menu:stats' },
                { text: '🔄 Refresh', callback_data: 'refresh:menu' }
            ],
            [
                { text: '🛒 Order Pending', callback_data: 'menu:orders' },
                { text: '💰 Payout Request', callback_data: 'menu:payouts' }
            ],
            [
                { text: '🔗 Admin Panel Web', url: `${API_BASE_URL}/admin` }
            ]
        ]
    }

    if (messageId) {
        await editMessage(chatId, messageId, text, { reply_markup: keyboard })
    } else {
        await sendMessage(text, { chat_id: chatId, reply_markup: keyboard })
    }
}

async function showStats(chatId: number, messageId: number) {
    // Fetch stats from API
    const stats = await callApi('bot-stats', 'GET')

    if (!stats) {
        await editMessage(chatId, messageId, "❌ Gagal mengambil data dari server.")
        return
    }

    const fmt = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    const text = `📊 *Live Statistics* (Updated: ${time})\n\n` +
        `👥 Total User: *${stats.totalUsers}*\n` +
        `💰 Total Revenue: *${fmt(stats.totalRevenue)}*\n` +
        `🛒 Order Pending: *${stats.pendingOrders}*\n` +
        `💸 Payout Pending: *${stats.pendingPayoutsCount}* (${fmt(stats.pendingPayoutsAmount)})`

    await editMessage(chatId, messageId, text, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔄 Refresh Data', callback_data: 'refresh:stats' }],
                [{ text: '🔙 Kembali ke Menu', callback_data: 'menu:start' }]
            ]
        }
    })
}

async function processUpdate(update: any) {
    if (update.callback_query) {
        const callback = update.callback_query
        const data = callback.data
        const chatId = callback.message.chat.id
        const msgId = callback.message.message_id

        if (String(chatId) !== String(CHAT_ID)) return

        if (data === 'menu:start' || data === 'refresh:menu') {
            await sendMainMenu(chatId, msgId)
        } else if (data === 'menu:stats' || data === 'refresh:stats') {
            await showStats(chatId, msgId)
        } else if (data.startsWith('approve_payout:')) {
            const parts = data.split(':')
            const userId = parts[1]
            const amount = Number(parts[2])

            const res = await callApi('approve-payout', 'POST', { userId, amount })

            if (res && res.success) {
                await editMessage(chatId, msgId, `✅ *Payout Berhasil*\nUser: ${userId}\nJumlah: ${amount}`)
            } else {
                await editMessage(chatId, msgId, `❌ *Payout Gagal*\n${res?.message || 'Unknown error'}`)
            }
        }
        await answerCallback(callback.id)
    }

    if (update.message) {
        const message = update.message
        const chatId = message.chat.id
        const text = message.text || ''

        if (String(chatId) !== String(CHAT_ID)) return

        if (text === '/start' || text === 'menu') {
            await sendMainMenu(chatId)
        }
    }
}

// --- SCHEDULER LOGIC ---
const notifyBot = async (message: string) => {
    try {
        await sendMessage(message)
    } catch (e) {
        console.error("Bot notification failed:", e)
    }
}

const runPaymentVerification = async () => {
    if (isSchedulerRunning) {
        console.log("[Scheduler] Previous job still running. Skipping...")
        return
    }

    isSchedulerRunning = true
    const startTime = new Date()
    console.log(`[Scheduler] Job started at ${startTime.toISOString()}`)

    try {
        // Run scraper
        // Note: gofood-scraper.cjs must be in the same folder or path must be correct
        const { stdout, stderr } = await execAsync('node gofood-scraper.cjs', {
            cwd: process.cwd(),
            timeout: 120000
        })

        const jsonMatch = stdout.match(/---JSON_START---([\s\S]*?)---JSON_END---/)
        if (!jsonMatch) {
            console.error("Scraper Output:", stdout)
            throw new Error("Scraper did not return valid JSON block.")
        }

        const transactions = JSON.parse(jsonMatch[1])
        console.log(`[Scheduler] Scraped ${transactions.length} transactions. Syncing to API...`)

        // Send to API
        const res = await callApi('sync-transactions', 'POST', { transactions })

        if (res && res.success) {
            console.log(`[Scheduler] Sync Success: ${res.message}`)
            if (res.approved > 0) {
                await notifyBot(res.message) // Notify summary of approvals
                // Note: Individual notifications are sent by the server via WA
            }
        } else {
            console.error("[Scheduler] Sync Failed:", res)
        }

        if (stderr && (stderr.includes('Login required') || stderr.includes('Session expired'))) {
            await notifyBot("🚨 *GoFood Session Expired!*\nMohon login ulang di VNC/Desktop.")
        }

    } catch (error: any) {
        console.error("[Scheduler] Job Failed:", error)
        if (error.message.includes('timeout')) {
            await notifyBot(`⚠️ *Scheduler Timeout*\nScraper took too long.`)
        }
    } finally {
        isSchedulerRunning = false
    }
}

// --- 10. WhatsApp Notification Poller ---
async function runNotificationPoller() {
    console.log('[NotificationPoller] Checking pending notifications...')
    try {
        const res = await callApi('notifications/poll', 'GET')
        if (!res.success || !res.data || res.data.length === 0) return

        console.log(`[NotificationPoller] Found ${res.data.length} pending notifications.`)

        const { sendLocalWhatsAppMessage } = await import('./utils-casaos/whatsapp-local')

        const sentIds = []
        for (const notif of res.data) {
            const success = await sendLocalWhatsAppMessage(notif.phoneNumber, notif.message)
            if (success) {
                sentIds.push(notif.id)
            }
        }

        if (sentIds.length > 0) {
            await callApi('notifications/confirm', 'POST', { ids: sentIds })
            console.log(`[NotificationPoller] Confirmed ${sentIds.length} notifications as sent.`)
        }
    } catch (e: any) {
        console.error('[NotificationPoller] Error:', e.message)
    }
}

// --- MAIN LOOPS ---
async function pollBot() {
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`)
        const data = await res.json()

        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                await processUpdate(update)
                lastUpdateId = update.update_id
            }
        }
    } catch (error) {
        console.error('Polling error:', error)
    }
    setTimeout(pollBot, POLL_INTERVAL)
}

// Start everything
if (!BOT_TOKEN || !API_SECRET) {
    console.error("❌ Missing Env Vars: TELEGRAM_BOT_TOKEN or INTERNAL_API_SECRET")
    process.exit(1)
}

import { initWhatsAppLocal } from './utils-casaos/whatsapp-local'

console.log('🚀 CasaOS Worker Starting...')
console.log(`Target API: ${API_BASE_URL}`)

// Initialize Local WhatsApp Bot (QR Scan)
initWhatsAppLocal()

pollBot()
console.log('🤖 Telegram Bot Polling Started...')

// Initial run
runPaymentVerification()
runNotificationPoller()
cron.schedule(CRON_SCHEDULE, () => {
    runPaymentVerification()
})
setInterval(runNotificationPoller, 60000)
console.log(`📅 Scheduler started with schedule: ${CRON_SCHEDULE}`)
console.log(`📨 Notification Poller started (1m interval)`)
