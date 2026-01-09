import { db } from '../../utils/db'
import { orders, users } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({
        headers: event.headers
    })

    const allowedRoles = ['admin', 'superuser', 'staff']
    if (!session || !allowedRoles.includes(session.user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const pendingOrders = await db.select({
        id: orders.id,
        userId: orders.userId,
        userName: users.name,
        userEmail: users.email,
        plan: orders.plan,
        amount: orders.amount,
        status: orders.status,
        proofUrl: orders.proofUrl,
        createdAt: orders.createdAt
    })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.status, 'pending'))
        .orderBy(desc(orders.createdAt))

    return pendingOrders
})
