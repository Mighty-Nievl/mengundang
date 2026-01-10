import { db } from '../../../utils/db'
import { users } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { sendTelegramMessage } from '../../../utils/telegram'

export default defineEventHandler(async (event) => {
    // 1. Verify User Session
    const user = event.context.user as any
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 2. Fetch Fresh Data
    const freshUser = await db.select().from(users).where(eq(users.id, user.id)).get()
    if (!freshUser) throw createError({ statusCode: 404, statusMessage: 'User Not Found' })

    const balance = freshUser.referralBalance || 0

    // 3. Check if already has pending request (prevent duplicate requests)
    if (freshUser.payoutPending) {
        throw createError({ statusCode: 400, statusMessage: 'Anda sudah memiliki permintaan payout yang sedang diproses.' })
    }

    // 4. Get Bank Details from Body
    const body = await readBody(event)
    const { bankName, bankAccountNumber, bankAccountName, phoneNumber } = body

    if (!bankName || !bankAccountNumber || !bankAccountName || !phoneNumber) {
        throw createError({ statusCode: 400, statusMessage: 'Mohon lengkapi info rekening & nomor WhatsApp' })
    }

    // 5. Validate Balance
    if (balance < 30000) {
        throw createError({ statusCode: 400, statusMessage: 'Saldo belum cukup (Min. Rp 30.000)' })
    }

    // 6. Update User Record with bank info AND set pending flag
    await db.update(users).set({
        bankName,
        bankAccountNumber,
        bankAccountName,
        phoneNumber,
        payoutPending: true,  // LOCK: Prevent duplicate requests
        updatedAt: new Date()
    }).where(eq(users.id, user.id))

    // 7. Send Telegram Notification to Admin
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(balance)

    try {
        await sendTelegramMessage(
            `💸 *New Payout Request*\n\n` +
            `👤 User: *${freshUser.name}*\n` +
            `📧 Email: ${freshUser.email}\n` +
            `💰 Amount: *${formattedAmount}*\n\n` +
            `🏦 *Rekening Tujuan:*\n` +
            `- Bank: ${bankName}\n` +
            `- No: ${bankAccountNumber}\n` +
            `- An: ${bankAccountName}\n` +
            `- WA: ${phoneNumber}\n\n` +
            `_Please check Admin Panel to process._`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Approve', callback_data: `approve_payout:${freshUser.id}:${balance}` },
                            { text: '❌ Reject', callback_data: `reject_payout:${freshUser.id}` }
                        ]
                    ]
                }
            }
        )
    } catch (e) {
        console.error('Failed to send TG notification', e)
    }

    return {
        success: true,
        message: 'Permintaan payout berhasil dikirim! Admin akan segera memproses.',
        amount: balance
    }
})
