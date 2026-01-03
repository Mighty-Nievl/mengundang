import { db } from './db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

export interface PlanConfig {
    name: string
    maxInvitations: number
    monthsActive: number | null // null for eternal
    maxGuests: number
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
    free: {
        name: 'Free',
        maxInvitations: 1,
        monthsActive: 1,
        maxGuests: 25
    },
    regular: {
        name: 'Regular',
        maxInvitations: 5,
        monthsActive: 3,
        maxGuests: 50
    },
    vip: {
        name: 'VIP',
        maxInvitations: 20,
        monthsActive: 6,
        maxGuests: 10000 // Effectively unlimited
    },
    vvip: {
        name: 'VVIP',
        maxInvitations: 9999, // Effectively unlimited
        monthsActive: null,
        maxGuests: 10000 // Effectively unlimited
    }
}

export async function applyPlanToUser(userId: string, planId: string) {
    const config = PLAN_CONFIGS[planId]
    if (!config) throw new Error(`Invalid plan ID: ${planId}`)

    let expiresAt: Date | null = new Date()
    if (config.monthsActive === null) {
        expiresAt = null
    } else {
        expiresAt.setMonth(expiresAt.getMonth() + config.monthsActive)
    }

    await db.update(users).set({
        plan: planId,
        planExpiresAt: expiresAt,
        maxInvitations: config.maxInvitations,
        maxGuests: config.maxGuests,
        updatedAt: new Date()
    }).where(eq(users.id, userId))

    console.log(`[PlanUtility] Applied ${planId} to user ${userId}. Max Inv: ${config.maxInvitations}, Max Guests: ${config.maxGuests}, Expires: ${expiresAt}`)
}
