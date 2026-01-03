import { db } from '../../../utils/db'
import { orders, users } from '../../../db/schema'
import { desc, eq } from 'drizzle-orm'
import { auth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
    const user = event.context.user

    if (!user || ((user as any).role !== 'admin' && (user as any).role !== 'staff')) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // Join orders with users to get user details
    const results = await db.select({
        id: orders.id,
        userId: orders.userId,
        userName: users.name,
        userEmail: users.email,
        plan: orders.plan,
        amount: orders.amount,
        status: orders.status,
        proofUrl: orders.proofUrl,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt
    })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .orderBy(desc(orders.createdAt))
        .all()

    return results
})
