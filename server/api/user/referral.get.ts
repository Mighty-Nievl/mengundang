import { auth } from '../../utils/auth';
import { db } from '../../utils/db';
import { users, referralTransactions, orders } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateReferralCode } from '../../utils/referral';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({
        headers: event.headers
    });

    if (!session || !session.user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const userId = session.user.id;

    // 1. Ensure user has a referral code
    let user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) { // Should not happen if session is valid
        throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    if (!user.referralCode) {
        // Generate and save if missing
        const newCode = generateReferralCode();
        await db.update(users).set({ referralCode: newCode }).where(eq(users.id, userId));
        user.referralCode = newCode;
    }

    // 2. Fetch Transactions
    const transactions = await db.select().from(referralTransactions)
        .where(eq(referralTransactions.referrerId, userId))
        .orderBy(desc(referralTransactions.createdAt));

    // 3. Fetch Invited Activity (from Orders)
    // We join with users to get the name of the referee
    const invitedActivity = await db.select({
        name: users.name,
        plan: orders.plan,
        status: orders.status,
        amount: orders.amount,
        discount: orders.referralDiscount,
        createdAt: orders.createdAt
    }).from(orders)
        .innerJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.referrerId, userId))
        .orderBy(desc(orders.createdAt));

    // Mask names: "Richard Zalan" -> "Ri**** Za***"
    const maskedActivity = invitedActivity.map((a: { name: string; plan: string; status: string; amount: number; discount: number | null; createdAt: Date }) => {
        const parts = a.name.split(' ');
        const maskedName = parts.map((p: string) => {
            if (p.length <= 2) return p;
            return p.substring(0, 2) + '*'.repeat(p.length - 2);
        }).join(' ');

        return {
            name: maskedName,
            plan: a.plan,
            status: a.status,
            amount: a.amount,
            discount: a.discount,
            createdAt: a.createdAt
        };
    });

    return {
        referralCode: user.referralCode,
        balance: user.referralBalance || 0,
        transactions: transactions,
        invitedFriends: maskedActivity // Renamed back for frontend compatibility but with more data
    };
});
