import { db } from '../../utils/db'
import { orders, users, referralTransactions } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { applyPlanToUser } from '../../utils/plan'
import { sendTelegramMessage } from '../../utils/telegram'
import { sendWhatsAppMessage } from '../../utils/whatsapp-cloud'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    // Security: Validate Flip Token
    const flipToken = body.token
    const expectedToken = process.env.FLIP_VALIDATION_TOKEN || config.flipValidationToken

    if (flipToken !== expectedToken) {
        console.warn('[FlipWebhook] Invalid token received:', flipToken)
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // Flip data is often sent as a JSON string in the 'data' field
    let data: any
    try {
        data = typeof body.data === 'string' ? JSON.parse(body.data) : body.data
    } catch (e) {
        console.error('[FlipWebhook] Failed to parse data field:', body.data)
        throw createError({ statusCode: 400, statusMessage: 'Invalid Body Data' })
    }

    const billId = data.bill_id?.toString()
    const status = data.status // SUCCESSFUL, FAILED, etc.

    if (status !== 'SUCCESSFUL') {
        return { success: true, message: 'Status not SUCCESSFUL, ignoring.' }
    }

    // Find Order
    const [order] = await db.select().from(orders).where(eq(orders.externalId, billId)).limit(1)

    if (!order) {
        console.warn('[FlipWebhook] Order not found for bill_id:', billId)
        return { success: true, message: 'Order not found, ignoring.' }
    }

    if (order.status === 'approved') {
        return { success: true, message: 'Order already processed.' }
    }

    // Process Payment
    try {
        await db.transaction(async (tx: typeof db) => {
            // 1. Update Order Status
            await tx.update(orders)
                .set({ status: 'approved', updatedAt: new Date() })
                .where(eq(orders.id, order.id))

            // 2. Activate Plan
            await applyPlanToUser(order.userId, order.plan, tx)

            // 3. Handle Referral Bonus (if any)
            if (order.referrerId) {
                let bonusAmount = 0
                if (order.plan === 'regular') bonusAmount = 5000
                else if (order.plan === 'vip') bonusAmount = 10000
                else if (order.plan === 'vvip') bonusAmount = 15000

                if (bonusAmount > 0) {
                    const [referrer] = await tx.select().from(users).where(eq(users.id, order.referrerId)).limit(1)
                    if (referrer) {
                        // Anti-fraud simple check (same IP) from order record
                        // Note: registrationIp is in user table, order.ipAddress is in order table
                        if (order.ipAddress !== referrer.registrationIp) {
                            await tx.update(users)
                                .set({ referralBalance: sql`${users.referralBalance} + ${bonusAmount}` })
                                .where(eq(users.id, order.referrerId))

                            await tx.insert(referralTransactions).values({
                                id: uuidv4(),
                                referrerId: order.referrerId,
                                refereeId: order.userId,
                                amount: bonusAmount,
                                type: 'bonus',
                                createdAt: new Date()
                            })

                            // Notify Referrer via TG/WA if possible (simplified for now)
                            console.log(`[FlipWebhook] Bonus ${bonusAmount} given to ${order.referrerId}`)
                        } else {
                            console.warn(`[FlipWebhook] Potential self-referral detected for order ${order.id}. IP match.`)
                        }
                    }
                }
            }
        })

        // 4. Notifications
        const fmt = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
        const msg = `💰 *Pembayaran Otomatis Berhasil!*\n\nOrder: #${order.id}\nPaket: ${order.plan.toUpperCase()}\nJumlah: ${fmt(order.amount)}\nMetode: Flip API\n\nStatus: Akun diaktifkan.`

        await sendTelegramMessage(msg)
        await sendWhatsAppMessage(msg.replace(/\*/g, '')) // Strip markdown for WA

        return { success: true }
    } catch (e: any) {
        console.error('[FlipWebhook] Error processing order:', e.message)
        throw createError({ statusCode: 500, statusMessage: 'Internal processing error' })
    }
})
