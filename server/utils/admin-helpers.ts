/**
 * Admin Panel Helpers
 * Shared utilities, types, and configs for admin panel
 */

// ============================================
// ALLOWED SETTINGS KEYS (Whitelist)
// ============================================
export const ALLOWED_SYSTEM_SETTINGS = [
    // General
    'upgrade_enabled',
    'maintenance_mode',

    // Email
    'email_rsvp_template',
    'email_from_name',

    // WhatsApp (re-exported from wa-helpers for convenience)
    'wa_cloud_token',
    'wa_cloud_phone_id',
    'wa_cloud_waba_id',
    'wa_target_phone',
    'wa_invitation_template',
    'wa_bot_last_seen',

    // Telegram
    'telegram_bot_token',
    'telegram_chat_id',
] as const

export type SystemSettingKey = typeof ALLOWED_SYSTEM_SETTINGS[number]

export function isValidSettingKey(key: string): key is SystemSettingKey {
    return ALLOWED_SYSTEM_SETTINGS.includes(key as SystemSettingKey)
}

// ============================================
// PLAN CONFIGURATION
// ============================================
export const PLAN_CONFIG = {
    free: {
        maxInvitations: 1,
        maxGuests: 25,
        label: 'Free'
    },
    regular: {
        maxInvitations: 3,
        maxGuests: 100,
        label: 'Regular'
    },
    vip: {
        maxInvitations: 10,
        maxGuests: 500,
        label: 'VIP'
    },
    vvip: {
        maxInvitations: 9999,
        maxGuests: 9999,
        label: 'VVIP'
    }
} as const

export type PlanId = keyof typeof PLAN_CONFIG

export function getPlanLimits(plan: string): { maxInvitations: number; maxGuests: number } {
    const config = PLAN_CONFIG[plan as PlanId]
    return config || PLAN_CONFIG.free
}

// ============================================
// TYPESCRIPT INTERFACES
// ============================================
export interface AdminUser {
    id: string
    email: string
    name: string
    role: 'admin' | 'superuser' | 'staff' | 'user'
    plan: PlanId
    maxInvitations: number
    maxGuests: number
    usage?: number
    referralBalance?: number
}

export interface AdminOrder {
    id: string
    userId: string
    userName: string
    userEmail: string
    plan: PlanId
    amount: number
    status: 'pending' | 'approved' | 'rejected' | 'paid'
    proofUrl: string | null
    createdAt: string
}

export interface AdminStats {
    totalUsers: number
    pendingOrders: number
    pendingPayouts: { count: number; amount: number }
    totalRevenue: number
    pendingWA: number
}

export interface PayoutUser {
    id: string
    name: string
    email: string
    referralBalance: number
}

export interface EmailLog {
    id: string
    recipient: string
    subject: string
    content: string
    status: 'sent' | 'failed'
    error?: string
    createdAt: string
}

// ============================================
// PROTECTED EMAILS (Cannot be deleted)
// ============================================
export const PROTECTED_EMAILS = [
    'support@mengundang.site',
    'admin@mengundang.site',
] as const

export function isProtectedEmail(email: string): boolean {
    return PROTECTED_EMAILS.includes(email as any)
}
