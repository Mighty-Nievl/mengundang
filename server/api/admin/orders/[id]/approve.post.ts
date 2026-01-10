import { db } from '../../../../utils/db'
import { orders, users, systemSettings } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../../../../utils/auth'
import { applyPlanToUser } from '../../../../utils/plan'
import { processReferralBonus } from '../../../../utils/referral'
import { sendTelegramMessage } from '../../../../utils/telegram'
import { sendWhatsAppNotification } from '../../../../utils/whatsapp'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({
        headers: event.headers
    })

    const allowedRoles = ['admin', 'superuser', 'staff']
    if (!session || !allowedRoles.includes(session.user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing ID' })

    const [order] = await db.select().from(orders).where(eq(orders.id, id))
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    if (order.status !== 'pending') {
        return { success: false, message: 'Order already processed' }
    }

    // Get user info for notification
    const [orderUser] = await db.select().from(users).where(eq(users.id, order.userId))

    // Update order status
    await db.update(orders).set({ status: 'approved', updatedAt: new Date() }).where(eq(orders.id, id))

    // Update user plan
    await applyPlanToUser(order.userId, order.plan)

    // Process Referral Bonus
    await processReferralBonus(order.userId, order.plan)

    // Send notifications (async)
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.amount)
    const notifText = `✅ *Order Approved*\n\n` +
        `👤 User: ${orderUser?.name || 'Unknown'}\n` +
        `📧 Email: ${orderUser?.email || 'N/A'}\n` +
        `📦 Plan: ${order.plan.toUpperCase()}\n` +
        `💰 Amount: ${formattedAmount}\n` +
        `👮 Admin: ${session.user.name}`

    // Telegram
    sendTelegramMessage(notifText).catch(e => console.error('[OrderApprove] TG failed:', e))

    // WhatsApp Cloud API
    try {
        const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, 'wa_target_phone')).limit(1)
        if (setting?.value) {
            await sendWhatsAppNotification(notifText, setting.value, 'official')
        }
    } catch (e) {
        console.error('[OrderApprove] WA failed:', e)
    }

    return { success: true }
})
