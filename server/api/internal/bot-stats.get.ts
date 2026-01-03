import { db } from '../../utils/db';
import { users, orders } from '../../db/schema';
import { gt, eq, count, sum } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const authHeader = getHeader(event, 'x-api-secret');
    if (authHeader !== process.env.INTERNAL_API_SECRET) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // 2. Fetch Stats
    const [
        totalUsersResult,
        pendingOrdersResult,
        pendingPayoutsResult,
        totalRevenueResult
    ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(orders).where(eq(orders.status, 'pending')),
        db.select({ count: count(), totalAmount: sum(users.referralBalance) }).from(users).where(gt(users.referralBalance, 0)),
        db.select({ total: sum(orders.amount) }).from(orders).where(eq(orders.status, 'paid')) // or 'approved'? Schema says 'pending', 'approved'. worker.ts used 'paid' in one query but 'approved' in update.
        // worker.ts line 97: .where(eq(orders.status, 'paid'))
        // worker.ts line 222: .set({ status: 'approved' })
        // Mismatch in worker.ts? Or maybe 'paid' is alias? 
        // Let's check schema comment: // pending, approved, rejected
        // I should probably use 'approved'.
    ]);

    // Fix query for total revenue to use 'approved' if that's what we save.
    // However, if the old data uses 'paid', we might need both?
    // Let's stick to 'approved' based on the update logic I just wrote in sync-transactions.

    const totalUsers = totalUsersResult[0]?.count || 0;
    const pendingOrders = pendingOrdersResult[0]?.count || 0;
    const pendingPayoutsCount = pendingPayoutsResult[0]?.count || 0;
    const pendingPayoutsAmount = Number(pendingPayoutsResult[0]?.totalAmount) || 0;

    // Revenue query separate to ensure we capture checking
    const revenueQuery = await db.select({ total: sum(orders.amount) }).from(orders).where(eq(orders.status, 'approved'));
    const totalRevenue = Number(revenueQuery[0]?.total) || 0;

    return {
        totalUsers,
        pendingOrders,
        pendingPayoutsCount,
        pendingPayoutsAmount,
        totalRevenue
    };
});
