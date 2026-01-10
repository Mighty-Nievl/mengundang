import { db } from '../../../utils/db'
import { waNotifications } from '../../../db/schema'
import { desc, eq, like, or, and, sql } from 'drizzle-orm'
import type { WALogsResponse, WALog } from '../../../utils/wa-helpers'

export default defineEventHandler(async (event): Promise<WALogsResponse> => {
    // Auth Check (Admin Only)
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']

    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    const query = getQuery(event)
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(Math.max(1, parseInt(query.limit as string) || 50), 100)
    const status = query.status as string || ''
    const search = query.search as string || ''

    try {
        // Build where conditions properly
        const conditions: any[] = []

        if (status && ['pending', 'sent', 'failed'].includes(status)) {
            conditions.push(eq(waNotifications.status, status))
        }

        if (search.trim()) {
            conditions.push(
                or(
                    like(waNotifications.phoneNumber, `%${search}%`),
                    like(waNotifications.message, `%${search}%`)
                )
            )
        }

        // Build the where clause - use AND for multiple conditions
        const whereClause = conditions.length > 0
            ? (conditions.length === 1 ? conditions[0] : and(...conditions))
            : undefined

        // Get total count with all conditions
        const countQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(waNotifications)

        if (whereClause) {
            countQuery.where(whereClause)
        }

        const [totalResult] = await countQuery
        const total = Number(totalResult?.count) || 0

        // Get logs with pagination and all conditions
        const logsQuery = db
            .select()
            .from(waNotifications)
            .orderBy(desc(waNotifications.createdAt))
            .limit(limit)
            .offset((page - 1) * limit)

        if (whereClause) {
            logsQuery.where(whereClause)
        }

        const logs = await logsQuery as WALog[]

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1
            }
        }
    } catch (e: any) {
        console.error('[WhatsAppLogs] Error:', e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch logs' })
    }
})
