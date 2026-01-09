import { db } from '../../utils/db'
import { orders, users } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '../../utils/auth'
import { sendTelegramMessage } from '../../utils/telegram'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const { orderId, proofUrl } = body

    if (!orderId || !proofUrl) {
        throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
    }

    // Update order
    const [order] = await db.select().from(orders).where(
        and(eq(orders.id, orderId), eq(orders.userId, session.user.id))
    )

    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    // Prevent Regression
    if (order.status === 'paid' || order.status === 'rejected') {
        throw createError({ statusCode: 400, statusMessage: 'Order ini sudah diproses dan tidak bisa diubah.' })
    }

    await db.update(orders).set({
        proofUrl,
        status: 'pending', // Keep as pending, but now with proof attached
        updatedAt: new Date()
    }).where(eq(orders.id, orderId))

    // Notify Admin with inline buttons
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.amount)
    const planBadge = order.plan === 'vvip' ? '💎' : order.plan === 'vip' ? '👑' : order.plan === 'premium' ? '⭐' : '🆕'

    const msg = `${planBadge} *BUKTI TRANSFER DITERIMA*\n\n` +
        `📦 Order: #${orderId.slice(0, 8)}\n` +
        `👤 *${session.user.name}*\n` +
        `📧 ${session.user.email}\n` +
        `📦 Paket: *${order.plan.toUpperCase()}*\n` +
        `💰 Total: *${formattedAmount}*\n\n` +
        `📎 [Lihat Bukti Transfer](${proofUrl})\n\n` +
        `_Klik tombol di bawah untuk approve!_`

    await sendTelegramMessage(msg, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ Approve', callback_data: `action:approve_order:${orderId}` },
                    { text: '❌ Reject', callback_data: `action:reject_order:${orderId}` }
                ],
                [
                    { text: '🔍 Lihat Bukti', url: proofUrl }
                ]
            ]
        }
    }).catch(console.error)

    return { success: true }
})
