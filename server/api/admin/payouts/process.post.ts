import { db } from '../../../utils/db'
import { users, referralTransactions, systemSettings } from '../../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { sendTelegramMessage } from '../../../utils/telegram'
import { sendWhatsAppNotification } from '../../../utils/whatsapp'

export default defineEventHandler(async (event) => {
    // 1. Verify Admin
    const user = event.context.user as any
    const allowedRoles = ['admin', 'superuser']
    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { userId, amount } = body

    if (!userId || !amount || amount <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid Data' })
    }

    // 2. Initial Check
    const targetUser = await db.select().from(users).where(eq(users.id, userId)).get()
    if (!targetUser) throw createError({ statusCode: 404, statusMessage: 'User Not Found' })

    if ((targetUser.referralBalance || 0) < amount) {
        throw createError({ statusCode: 400, statusMessage: 'Saldo user tidak cukup' })
    }

    // 3. Process Transaction
    try {
        await db.transaction(async (tx: any) => {
            // Deduct Balance AND reset pending flag
            await tx.update(users)
                .set({
                    referralBalance: sql`${users.referralBalance} - ${amount}`,
                    payoutPending: false,
                    updatedAt: new Date()
                })
                .where(eq(users.id, userId))
                .run()

            // Record Transaction
            await tx.insert(referralTransactions).values({
                id: uuidv4(),
                referrerId: userId,
                refereeId: user.id,
                amount: amount,
                type: 'withdrawal',
                createdAt: new Date()
            }).run()
        })

        // 4. Send notifications
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
        const notifText = `💸 *Payout Processed*\n\n` +
            `👤 User: ${targetUser.name}\n` +
            `📧 Email: ${targetUser.email}\n` +
            `💰 Amount: ${formattedAmount}\n` +
            `🏦 Bank: ${targetUser.bankName || 'N/A'} - ${targetUser.bankAccountNumber || 'N/A'}\n` +
            `👮 Admin: ${user.name}`

        // Telegram
        sendTelegramMessage(notifText).catch(e => console.error('[PayoutProcess] TG failed:', e))

        // WhatsApp Cloud API
        try {
            const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, 'wa_target_phone')).limit(1)
            if (setting?.value) {
                await sendWhatsAppNotification(notifText, setting.value, 'official')
            }
        } catch (e) {
            console.error('[PayoutProcess] WA failed:', e)
        }

        return { success: true }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: 'Database Error: ' + e.message })
    }
})
