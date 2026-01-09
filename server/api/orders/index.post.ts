import { db } from '../../utils/db'
import { orders, users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../../utils/auth'
import { nanoid } from 'nanoid'
import { sendTelegramMessage } from '../../utils/telegram'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({
        headers: event.headers
    })

    if (!session) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { plan, amount, proofUrl } = body

    if (!plan || !amount) {
        throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    // 2. Handle Referral Discount
    const referralCode = body.referralCode || getCookie(event, 'referral_code')
    let referrerId = null
    let discount = 0

    // Capture Client IP
    const clientIp = event.headers.get('x-forwarded-for') || event.node.req.socket.remoteAddress || null

    if (referralCode) {
        const [referrer] = await db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1)
        if (referrer && referrer.id !== session.user.id) {
            referrerId = referrer.id

            // Tiered Discount
            if (plan === 'regular') discount = 5000
            else if (plan === 'vip') discount = 10000
            else if (plan === 'vvip') discount = 15000
        }
    }

    // 1. Calculate Amount
    const baseAmount = Number(amount)
    const totalAmount = baseAmount - discount
    const orderId = nanoid()

    // 2. Create Flip Bill
    let flipBillId = null
    let paymentUrl = null
    /* FLIP DISABLED TEMPORARILY - FALLBACK TO MANUAL */
    /*
    try {
        const flipBill = await createFlipBill(
            orderId,
            totalAmount,
            `Paket ${plan.toUpperCase()} - Undangan`
        )
        flipBillId = flipBill.bill_id.toString()
        paymentUrl = flipBill.payment_url
    } catch (e: any) {
        console.error('[CreateOrder] Flip Error:', e)
        throw createError({ 
            statusCode: 500, 
            statusMessage: e.message || 'Gagal membuat tagihan Flip.',
            data: e.data 
        })
    }
    */

    // Manual Mode
    flipBillId = `MANUAL-${orderId}`
    paymentUrl = null // Signals frontend to show QRIS

    await db.insert(orders).values({
        id: orderId,
        userId: session.user.id,
        plan,
        amount: totalAmount,
        status: 'pending',
        referrerId,
        referralDiscount: discount,
        ipAddress: clientIp,
        externalId: flipBillId,
        paymentUrl: paymentUrl,
        createdAt: new Date(),
        updatedAt: new Date()
    })

    // Non-blocking notification
    notifyAdmin(session.user, plan, totalAmount).catch(console.error)

    return {
        success: true,
        orderId,
        totalAmount,
        paymentUrl
    }
})

// Async Telegram Notification
async function notifyAdmin(user: any, plan: string, amount: number) {
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
    await sendTelegramMessage(`🛒 *New Order Created*\n\nUser: ${user.name} (${user.email})\nPlan: ${plan}\nAmount: ${formattedAmount}\n\n_Please check iPayMu dashboard/Admin Panel to verify._`)
}
