import { sendTelegramMessage } from '../../utils/telegram'
import { db } from '../../utils/db'
import { users, orders, referralTransactions } from '../../db/schema'
import { gt, eq, desc, count, sum, sql, and, isNotNull } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const ADMIN_CHAT_ID = "848564111"
    const BOT_TOKEN = "8516625514:AAHMZtRCVqba6cpiblzb0b3Lr12LS_zXjnE"

    // --- HELPER: Send Menu ---
    const sendMainMenu = async (chatId: number, messageId?: number) => {
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
                    { text: '🔗 Admin Panel Web', url: 'https://mengundang.site/admin' }
                ]
            ]
        }

        if (messageId) {
            // Edit existing message
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: messageId,
                    text: text,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                })
            })
        } else {
            // Send new message
            await sendTelegramMessage(text, {
                chat_id: chatId,
                reply_markup: keyboard,
                token: BOT_TOKEN // Pass token to helper
            })
        }
    }

    // --- HELPER: Show Stats ---
    const showStats = async (chatId: number, messageId: number) => {
        const [
            totalUsersResult,
            pendingOrdersResult,
            pendingPayoutsResult,
            totalRevenueResult
        ] = await Promise.all([
            db.select({ count: count() }).from(users),
            db.select({ count: count() }).from(orders).where(and(eq(orders.status, 'pending'), isNotNull(orders.proofUrl))),
            db.select({ count: count() }).from(users).where(gt(users.referralBalance, 0)),
            db.select({ total: sum(orders.amount) }).from(orders).where(eq(orders.status, 'paid'))
        ])

        const totalUsers = totalUsersResult[0]?.count || 0
        const pendingOrders = pendingOrdersResult[0]?.count || 0
        const pendingPayouts = pendingPayoutsResult[0]?.count || 0
        const totalRevenue = Number(totalRevenueResult[0]?.total) || 0
        const formattedRevenue = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue)
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

        const text = `📊 *Live Statistics* (Updated: ${time})\n\n` +
            `👥 Total User: *${totalUsers}*\n` +
            `💰 Revenue: *${formattedRevenue}*\n` +
            `🛒 Order Pending: *${pendingOrders}*\n` +
            `💸 Payout Pending: *${pendingPayouts}*`

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: text,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔄 Refresh Data', callback_data: 'refresh:stats' }],
                        [{ text: '🔙 Kembali ke Menu', callback_data: 'menu:start' }]
                    ]
                }
            })
        })
    }

    // --- HELPER: Browse Orders ---
    const browseOrders = async (chatId: number, messageId: number) => {
        const pendingOrders = await db.select({
            id: orders.id,
            userId: orders.userId,
            plan: orders.plan,
            amount: orders.amount,
            proofUrl: orders.proofUrl,
            createdAt: orders.createdAt,
            userName: users.name,
            userEmail: users.email
        })
            .from(orders)
            .leftJoin(users, eq(orders.userId, users.id))
            .where(and(eq(orders.status, 'pending'), isNotNull(orders.proofUrl)))

            .orderBy(desc(orders.createdAt))
            .limit(5)
            .all()

        if (pendingOrders.length === 0) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: messageId,
                    text: `✅ *Tidak ada Order Pending*\nSemua pesanan sudah diproses.`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🔙 Kembali ke Menu', callback_data: 'menu:start' }]]
                    }
                })
            })
            return
        }

        // Send Header (Edit)
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: `🛒 *Daftar Order Pending (Top 5)*\nSilakan proses order di bawah ini:`,
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [] } // Clear buttons
            })
        })

        // Send Cards
        for (const o of pendingOrders) {
            let planBadge = '🆕'
            if (o.plan === 'vip') planBadge = '👑'
            if (o.plan === 'vvip') planBadge = '💎'
            if (o.plan === 'premium') planBadge = '⭐'
            const amount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(o.amount)

            await sendTelegramMessage(
                `${planBadge} *ORDER #${o.id.slice(0, 8)}*\n\n` +
                `👤 *${o.userName || 'Unknown'}*\n` +
                `📧 ${o.userEmail || 'N/A'}\n` +
                `📦 Paket: *${o.plan.toUpperCase()}*\n` +
                `💰 Total: *${amount}*\n` +
                `🗓️ ${new Date(o.createdAt).toLocaleString('id-ID')}\n\n` +
                `📎 [Lihat Bukti Transfer](${o.proofUrl})`,
                {
                    chat_id: chatId,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Approve', callback_data: `action:approve_order:${o.id}` },
                                { text: '❌ Reject', callback_data: `action:reject_order:${o.id}` }
                            ],
                            [
                                { text: '🔍 Lihat Bukti', url: o.proofUrl || 'https://mengundang.site' }
                            ]
                        ]
                    }
                }
            )
        }


        // Send Footer Navigation
        await sendTelegramMessage(`_Gunakan menu di bawah untuk navigasi:_`, {
            chat_id: chatId,
            reply_markup: {
                inline_keyboard: [[{ text: '🔙 Kembali ke Menu Utama', callback_data: 'menu:start_new' }]]
            }
        })
    }

    // --- HELPER: Browse Payouts ---
    const browsePayouts = async (chatId: number, messageId: number) => {
        const pendingUsers = await db.select().from(users).where(gt(users.referralBalance, 0)).limit(5).all()

        if (pendingUsers.length === 0) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: messageId,
                    text: `✅ *Tidak ada Payout Pending*\nSemua dompet aman terkendali.`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🔙 Kembali ke Menu', callback_data: 'menu:start' }]]
                    }
                })
            })
            return
        }

        // Header
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: `💰 *Daftar Payout Pending (Top 5)*\nSilakan proses pencairan dana di bawah:`,
                parse_mode: 'Markdown'
            })
        })

        // Cards
        for (const u of pendingUsers) {
            const amount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(u.referralBalance || 0)
            await sendTelegramMessage(
                `👤 *${u.name}*\n📧 ${u.email}\n💰 Tagihan: *${amount}*`,
                {
                    chat_id: chatId,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Transfer & Potong', callback_data: `approve_payout:${u.id}:${u.referralBalance}` },
                                { text: '❌ Reject', callback_data: `reject_payout:${u.id}` }
                            ]
                        ]
                    }
                }
            )
        }

        // Footer
        await sendTelegramMessage(`_Gunakan menu di bawah untuk navigasi:_`, {
            chat_id: chatId,
            reply_markup: {
                inline_keyboard: [[{ text: '🔙 Kembali ke Menu Utama', callback_data: 'menu:start_new' }]]
            }
        })
    }


    // ====== MAIN LOGIC ======

    // 1. Handle CALLBACK QUERY
    if (body.callback_query) {
        const callback = body.callback_query
        const data = callback.data
        const cbChatId = callback.message.chat.id
        const msgId = callback.message.message_id


        if (String(cbChatId).trim() !== ADMIN_CHAT_ID) {
            console.warn(`Unauthorized callback from ${cbChatId}, expected ${ADMIN_CHAT_ID}`)
            return { status: 'unauthorized' }
        }

        // Navigation
        if (data === 'menu:start') {
            await sendMainMenu(cbChatId, msgId)
        } else if (data === 'menu:start_new') {
            await sendMainMenu(cbChatId) // Send fresh message
        } else if (data === 'refresh:menu') {
            await sendMainMenu(cbChatId, msgId) // Just re-render
        }

        // Features
        else if (data === 'menu:stats' || data === 'refresh:stats') {
            await showStats(cbChatId, msgId)
        } else if (data === 'menu:orders') {
            await browseOrders(cbChatId, msgId)
        } else if (data === 'menu:payouts') {
            await browsePayouts(cbChatId, msgId)
        }

        // Actions: Orders
        else if (data.startsWith('action:approve_order:')) {
            const orderId = data.split(':')[2]
            try {
                await db.transaction(async (tx) => {
                    const order = await tx.select().from(orders).where(eq(orders.id, orderId)).get()
                    if (!order || order.status === 'paid') throw new Error('Order not found or already paid')

                    // Update Order
                    await tx.update(orders).set({ status: 'paid', updatedAt: new Date() }).where(eq(orders.id, orderId)).run()

                    // Determine User Plan Update
                    let newMaxInv = 1
                    if (order.plan === 'premium') newMaxInv = 3
                    if (order.plan === 'vip') newMaxInv = 10
                    if (order.plan === 'vvip') newMaxInv = 100

                    // Update User
                    await tx.update(users).set({
                        plan: order.plan,
                        maxInvitations: newMaxInv
                    }).where(eq(users.id, order.userId)).run()

                    // Referral Bonus Logic (Simplified for brevity, assuming standard 10k)
                    const user = await tx.select().from(users).where(eq(users.id, order.userId)).get()
                    if (user && user.referredBy) {
                        const referrer = await tx.select().from(users).where(eq(users.referralCode, user.referredBy)).get()
                        if (referrer) {
                            await tx.update(users).set({
                                referralBalance: sql`${users.referralBalance} + 10000`
                            }).where(eq(users.id, referrer.id)).run()

                            await tx.insert(referralTransactions).values({
                                id: uuidv4(),
                                referrerId: referrer.id,
                                refereeId: user.id,
                                amount: 10000,
                                type: 'bonus',
                                createdAt: new Date()
                            }).run()
                        }
                    }
                })

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: cbChatId,
                        message_id: msgId,
                        text: `✅ *Order Approved*\nID: ${orderId}\n\n_User plan updated._`,
                        parse_mode: 'Markdown'
                    })
                })
            } catch (e: any) {
                // Error
            }
        }
        else if (data.startsWith('action:reject_order:')) {
            const orderId = data.split(':')[2]
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: cbChatId,
                    message_id: msgId,
                    text: `❌ *Order Rejected*\nID: ${orderId}`,
                    parse_mode: 'Markdown'
                })
            })
        }

        // Actions: Payouts (Reused from previous step)
        else if (data.startsWith('approve_payout:')) {
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

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: cbChatId,
                        message_id: msgId,
                        text: `✅ *Payout Berhasil*\nUser: ${userId}\nJumlah: ${amount}`,
                        parse_mode: 'Markdown'
                    })
                })
            } catch (e) { }
        }
        else if (data.startsWith('reject_payout:')) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: cbChatId,
                    message_id: msgId,
                    text: `❌ *Payout Ditolak*`,
                    parse_mode: 'Markdown'
                })
            })
        }

        // Always answer callback to stop loading animation
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callback.id })
        })

        return { status: 'handled' }
    }

    // 2. Handle TEXT COMMANDS
    const message = body?.message
    if (!message) return { status: 'ignored' }
    const chatId = message.chat.id


    if (String(chatId).trim() !== ADMIN_CHAT_ID) {
        console.warn(`Unauthorized message from ${chatId}, expected ${ADMIN_CHAT_ID}`)
        await sendTelegramMessage(`⚠️ Unauthorized Access (ID: ${chatId}).`, { chat_id: chatId })
        return { status: 'unauthorized' }
    }

    if (message.text === '/start' || message.text === 'menu') {
        await sendMainMenu(chatId)
    } else {
        await sendMainMenu(chatId) // Default to menu for any input
    }

    return { status: 'ok' }
})
