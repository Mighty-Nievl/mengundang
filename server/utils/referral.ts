import { db } from './db';
import { users, referralTransactions } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================
// REFERRAL CONFIG
// ============================================
export const REFERRAL_BONUS = {
    regular: 5000,
    vip: 10000,
    vvip: 15000,
    official: 15000,  // Same as VVIP
} as const;

export type PlanWithBonus = keyof typeof REFERRAL_BONUS;

export function getBonusAmount(plan: string): number {
    const normalized = plan.toLowerCase() as PlanWithBonus;
    return REFERRAL_BONUS[normalized] || REFERRAL_BONUS.regular;
}

export function generateReferralCode(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// ============================================
// PROCESS REFERRAL BONUS
// ============================================
export async function processReferralBonus(userId: string, plan: string): Promise<boolean> {
    console.log(`[Referral] Processing bonus for user ${userId} (Plan: ${plan})`);

    // 1. Check if user was referred
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user || !user.referredBy) {
        console.log(`[Referral] User ${userId} has no referrer. Skipping.`);
        return false;
    }

    // 2. Find Referrer
    const [referrer] = await db.select().from(users).where(eq(users.referralCode, user.referredBy));

    if (!referrer) {
        console.log(`[Referral] Referrer with code ${user.referredBy} not found.`);
        return false;
    }

    // SECURITY: Prevent self-referral (double check)
    if (referrer.id === userId) {
        console.warn(`[Referral] BLOCKED: User ${userId} tried to self-refer!`);
        return false;
    }

    // 3. SECURITY: Check if bonus already given for this user
    // Only one bonus per referred user (first upgrade only)
    const existingBonus = await db.select()
        .from(referralTransactions)
        .where(
            and(
                eq(referralTransactions.referrerId, referrer.id),
                eq(referralTransactions.refereeId, userId),
                eq(referralTransactions.type, 'bonus')
            )
        )
        .get();

    if (existingBonus) {
        console.log(`[Referral] Bonus already given for user ${userId}. Skipping duplicate.`);
        return false;
    }

    // 4. Get dynamic bonus based on plan
    const bonusAmount = getBonusAmount(plan);

    // 5. Update Referrer Balance
    await db.update(users)
        .set({
            referralBalance: sql`${users.referralBalance} + ${bonusAmount}`,
            updatedAt: new Date()
        })
        .where(eq(users.id, referrer.id));

    // 6. Record Transaction
    await db.insert(referralTransactions).values({
        id: crypto.randomUUID(),
        referrerId: referrer.id,
        refereeId: userId,
        amount: bonusAmount,
        type: 'bonus',
        createdAt: new Date()
    });

    console.log(`[Referral] Bonus of ${bonusAmount} awarded to ${referrer.name} (${referrer.id}) for referring ${user.name}`);
    return true;
}
