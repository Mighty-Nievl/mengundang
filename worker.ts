import { db } from './server/utils/db'
import { users, orders, referralTransactions } from './server/db/schema'
import { gt, eq, desc, count, sum, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import cron from 'node-cron'
import { exec } from 'child_process'
import { promisify } from 'util'
import { sendWhatsAppMessage } from './server/utils/whatsapp-cloud'
import { applyPlanToUser } from './server/utils/plan'

const execAsync = promisify(exec)

// --- CONFIGURATION ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!
const POLL_INTERVAL = 1000 // 1 second for better responsiveness
const CRON_SCHEDULE = '*/5 * * * *' // Every 5 minutes

let lastUpdateId = 0
let isSchedulerRunning = false

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
    const text = `🤖 *Admin Command Center*\n\nSelamat datang, Admin! Silakan pilih menu di bawah untuk mengelola sistem.`
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
                { text: '🔗 Admin Panel Web', url: 'https://undangan.zalan.web.id/admin' }
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
    const [
        totalUsersResult,
        pendingOrdersResult,
        pendingPayoutsResult,
        totalRevenueResult
    ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(orders).where(eq(orders.status, 'pending')),
        db.select({ count: count(), totalAmount: sum(users.referralBalance) }).from(users).where(gt(users.referralBalance, 0)),
        db.select({ total: sum(orders.amount) }).from(orders).where(eq(orders.status, 'paid'))
    ])

    const totalUsers = totalUsersResult[0]?.count || 0
    const pendingOrders = pendingOrdersResult[0]?.count || 0
    const pendingPayoutsCount = pendingPayoutsResult[0]?.count || 0
    const pendingPayoutsAmount = Number(pendingPayoutsResult[0]?.totalAmount) || 0
    const totalRevenue = Number(totalRevenueResult[0]?.total) || 0

    const fmt = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    const text = `📊 *Live Statistics* (Updated: ${time})\n\n` +
        `👥 Total User: *${totalUsers}*\n` +
        `💰 Total Revenue: *${fmt(totalRevenue)}*\n` +
        `🛒 Order Pending: *${pendingOrders}*\n` +
        `💸 Payout Pending: *${pendingPayoutsCount}* (${fmt(pendingPayoutsAmount)})`

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

            try {
                await db.transaction(async (tx) => {
                    const targetUser = await tx.select().from(users).where(eq(users.id, userId)).get()
                    if (!targetUser || (targetUser.referralBalance || 0) < amount) throw new Error('Saldo kurang')

                    await tx.update(users).set({ referralBalance: sql`${users.referralBalance} - ${amount}` }).where(eq(users.id, userId)).run()
                    await tx.insert(referralTransactions).values({
                        id: uuidv4(), referrerId: userId, refereeId: 'admin-tg', amount, type: 'withdrawal', createdAt: new Date()
                    }).run()
                })
                await editMessage(chatId, msgId, `✅ *Payout Berhasil*\nUser: ${userId}\nJumlah: ${amount}`)
            } catch (e) {
                console.error('Payout error:', e)
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
        await sendMessage(message) // Reuse bot sendMessage
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
        const pendingOrders = await db.select().from(orders).where(eq(orders.status, 'pending'))

        let approvedCount = 0
        for (const order of pendingOrders) {
            const matchedTx = transactions.find((tx: any) => {
                let txAmount = 0
                if (tx.amount && tx.amount !== "0") {
                    txAmount = parseInt(tx.amount.replace(/[^0-9]/g, ''), 10)
                }
                const isSuccess = tx.status && (tx.status.toLowerCase().includes('berhasil') || tx.status.toLowerCase().includes('settlement'))
                return isSuccess && txAmount === order.amount
            })

            if (matchedTx) {
                console.log(`[Scheduler] MATCH FOUND! Order ${order.id} matches transaction of ${matchedTx.amount}`)
                await db.update(orders).set({ status: 'approved', updatedAt: new Date() }).where(eq(orders.id, order.id))
                await applyPlanToUser(order.userId, order.plan)
                await notifyBot(`💰 *Pembayaran Diterima!*\nOrder #${order.id} Lunas Rp ${order.amount}.\nStatus: Approved.`)
                approvedCount++
            }
        }

        if (stderr && (stderr.includes('Login required') || stderr.includes('Session expired'))) {
            await notifyBot("🚨 *GoFood Session Expired!*\nMohon login ulang di server segera.")
        }

        console.log(`[Scheduler] Finished. Approved ${approvedCount} orders.`)
    } catch (error: any) {
        console.error("[Scheduler] Job Failed:", error)
        // Only notify critical failures
        if (error.message.includes('timeout')) {
            await notifyBot(`⚠️ *Scheduler Timeout*\nScraper took too long.`)
        }
    } finally {
        isSchedulerRunning = false
        const endTime = new Date()
        const duration = (endTime.getTime() - startTime.getTime()) / 1000
        console.log(`[Scheduler] Job finished in ${duration}s`)
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
console.log('🚀 Unified Worker Starting...')
pollBot()
console.log('🤖 Telegram Bot Polling Started...')

runPaymentVerification() // Initial run
cron.schedule(CRON_SCHEDULE, () => {
    runPaymentVerification()
})
console.log(`📅 Scheduler started with schedule: ${CRON_SCHEDULE}`)
