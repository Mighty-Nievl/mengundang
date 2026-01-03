import { db } from './db';
import { users, referralTransactions } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export function generateReferralCode(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

export async function processReferralBonus(userId: string, plan: string) {
    console.log(`[Referral] Processing bonus for user ${userId} (Plan: ${plan})`);

    // 1. Check if user was referred
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user || !user.referredBy) {
        console.log(`[Referral] User ${userId} has no referrer. Skipping.`);
        return;
    }

    // 2. Find Referrer
    const [referrer] = await db.select().from(users).where(eq(users.referralCode, user.referredBy));

    if (!referrer) {
        console.log(`[Referral] Referrer with code ${user.referredBy} not found.`);
        return;
    }

    // 3. Check if bonus already given for this user (prevent duplicate bonuses)
    // Optional: We might want to allow bonuses for renewals, but for now let's assume one-time bonus per upgrade?
    // Or just simple logic: every paid upgrade gives 10k.

    // Let's stick to the plan: 10k bonus per successful upgrade.
    const BONUS_AMOUNT = 10000;

    // 4. Update Referrer Balance
    await db.update(users)
        .set({
            referralBalance: sql`${users.referralBalance} + ${BONUS_AMOUNT}`,
            updatedAt: new Date()
        })
        .where(eq(users.id, referrer.id));

    // 5. Record Transaction
    await db.insert(referralTransactions).values({
        id: crypto.randomUUID(),
        referrerId: referrer.id,
        refereeId: userId,
        amount: BONUS_AMOUNT,
        type: 'bonus',
        createdAt: new Date()
    });

    console.log(`[Referral] Bonus of ${BONUS_AMOUNT} awarded to ${referrer.name} (${referrer.id}) for referring ${user.name}`);
}
