import { db } from '../../utils/db'
import { users, orders } from '../../db/schema'
import { eq, count, sum, gt } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. Verify Admin
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser', 'staff']
    if (!user || !allowedRoles.includes((user as any).role)) {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    try {
        // Parallel queries for speed
        const [
            totalUsersResult,
            pendingOrdersResult,
            pendingPayoutsResult,
            totalRevenueResult
        ] = await Promise.all([
            // Total Users
            db.select({ count: count() }).from(users),

            // Pending Orders
            db.select({ count: count() }).from(orders).where(eq(orders.status, 'pending')),

            // Pending Payouts (Users with balance > 0)
            db.select({
                count: count(),
                totalAmount: sum(users.referralBalance)
            }).from(users).where(gt(users.referralBalance, 0)),

            // Total Revenue (Paid orders)
            db.select({
                total: sum(orders.amount)
            }).from(orders).where(eq(orders.status, 'paid'))
        ])

        return {
            totalUsers: totalUsersResult[0]?.count || 0,
            pendingOrders: pendingOrdersResult[0]?.count || 0,
            pendingPayouts: {
                count: pendingPayoutsResult[0]?.count || 0,
                amount: Number(pendingPayoutsResult[0]?.totalAmount) || 0
            },
            totalRevenue: Number(totalRevenueResult[0]?.total) || 0
        }

    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: 'Stats Error: ' + e.message })
    }
})
