import { db } from '../../utils/db'
import { emailNotifications } from '../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. Auth Check (Admin Only)
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']

    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    // 2. Fetch Logs
    try {
        const logs = await db.select()
            .from(emailNotifications)
            .orderBy(desc(emailNotifications.createdAt))
            .limit(100)

        return logs
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
