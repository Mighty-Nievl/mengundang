import { db } from '../../utils/db';
import { users, referralTransactions } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const authHeader = getHeader(event, 'x-api-secret');
    if (authHeader !== process.env.INTERNAL_API_SECRET) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // 2. Parse Body
    const body = await readBody(event);
    const { userId, amount } = body;

    if (!userId || !amount) {
        return { success: false, message: 'Missing userId or amount' };
    }

    try {
        await db.transaction(async (tx: any) => {
            const targetUser = await tx.select().from(users).where(eq(users.id, userId)).get();
            if (!targetUser || (targetUser.referralBalance || 0) < amount) {
                throw new Error('Saldo kurang');
            }

            // Deduct Balance
            await tx.update(users).set({
                referralBalance: sql`${users.referralBalance} - ${amount}`
            }).where(eq(users.id, userId)).run();

            // Record Transaction
            await tx.insert(referralTransactions).values({
                id: uuidv4(),
                referrerId: userId,
                refereeId: 'admin-tg',
                amount,
                type: 'withdrawal',
                createdAt: new Date()
            }).run();
        });

        return { success: true, message: 'Payout approved' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
});
