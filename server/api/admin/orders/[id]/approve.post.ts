import { db } from '../../../../utils/db'
import { orders, users } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../../../../utils/auth'
import { applyPlanToUser } from '../../../../utils/plan'
import { processReferralBonus } from '../../../../utils/referral' // Import Referral Utility

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

    // Update order status
    await db.update(orders).set({ status: 'approved', updatedAt: new Date() }).where(eq(orders.id, id))

    // Update user plan, expiry & invitation limits using centralized utility
    await applyPlanToUser(order.userId, order.plan)

    // Process Referral Bonus
    await processReferralBonus(order.userId, order.plan)

    return { success: true }
})
