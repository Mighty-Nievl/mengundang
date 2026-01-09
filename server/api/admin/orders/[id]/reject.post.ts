import { db } from '../../../../utils/db'
import { orders } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../../../../utils/auth'

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
    await db.update(orders).set({ status: 'rejected', updatedAt: new Date() }).where(eq(orders.id, id))

    return { success: true }
})
