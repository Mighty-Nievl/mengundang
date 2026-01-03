import { db } from '../../utils/db'
import { orders } from '../../db/schema'
import { auth } from '../../utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({
        headers: event.headers
    })

    if (!session) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const orderId = getRouterParam(event, 'id')
    if (!orderId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing Order ID' })
    }

    const [order] = await db.select()
        .from(orders)
        .where(
            and(
                eq(orders.id, orderId),
                eq(orders.userId, session.user.id)
            )
        )

    if (!order) {
        throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    }

    return {
        status: order.status,
        amount: order.amount,
        plan: order.plan
    }
})
