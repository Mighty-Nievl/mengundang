/**
 * WhatsApp Utility Functions
 * Shared utilities for WhatsApp-related operations
 */

// Allowed settings keys for WhatsApp configuration
export const ALLOWED_WA_SETTINGS = [
    'wa_cloud_token',
    'wa_cloud_phone_id',
    'wa_cloud_waba_id',
    'wa_target_phone',
    'wa_invitation_template',
    'wa_bot_last_seen',
    // Admin notification templates
    'wa_tpl_order_new',
    'wa_tpl_order_approved',
    'wa_tpl_payout_request',
    'wa_tpl_payout_processed'
] as const

export type WASettingKey = typeof ALLOWED_WA_SETTINGS[number]

// Default templates
export const DEFAULT_TEMPLATES = {
    order_new: `🛒 *Order Baru*

👤 User: {name}
📧 Email: {email}
📦 Plan: {plan}
💰 Amount: {amount}

_Cek Admin Panel untuk verifikasi._`,

    order_approved: `✅ *Order Approved*

👤 User: {name}
📧 Email: {email}
📦 Plan: {plan}
💰 Amount: {amount}
👮 Admin: {admin}`,

    payout_request: `💸 *Payout Request*

👤 User: {name}
📧 Email: {email}
💰 Amount: {amount}

🏦 *Rekening:*
- Bank: {bank}
- No: {account}
- An: {account_name}
- WA: {phone}

_Cek Admin Panel untuk proses._`,

    payout_processed: `💸 *Payout Processed*

👤 User: {name}
📧 Email: {email}
💰 Amount: {amount}
🏦 Bank: {bank} - {account}
👮 Admin: {admin}`
}

/**
 * Render template with variables
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
    let result = template
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '')
    }
    return result
}

/**
 * Format phone number to Indonesian international format (62xxx)
 * Handles various input formats: 0857..., 857..., +62857..., 62857...
 */
export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')

    // Handle different formats
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1)
    } else if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned
    }

    return cleaned
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhoneNumber(phone: string): boolean {
    const formatted = formatPhoneNumber(phone)
    // Indonesian phone numbers: 62 + 8-13 digits
    return /^62\d{8,13}$/.test(formatted)
}

/**
 * Mask sensitive data (show last N characters)
 */
export function maskSensitiveData(data: string, visibleChars: number = 8): string {
    if (!data) return ''
    if (data.length <= visibleChars) return '•'.repeat(data.length)
    return '•'.repeat(12) + data.slice(-visibleChars)
}

// TypeScript interfaces for WhatsApp API

export interface WASettings {
    cloudToken: string
    cloudPhoneId: string
    cloudWabaId: string
    targetPhone: string
    template: string
    hasToken?: boolean
    tplOrderNew?: string
    tplOrderApproved?: string
    tplPayoutRequest?: string
    tplPayoutProcessed?: string
}

export interface WAMetrics {
    pending: number
    sent: number
    failed: number
}

export interface WABotStatus {
    lastSeen: string | null
    isOnline: boolean
    cloudApiOk?: boolean
    botOnline?: boolean
    botLastSeen?: string | null
}

export interface WALog {
    id: string
    phoneNumber: string
    message: string
    status: 'pending' | 'sent' | 'failed'
    createdAt: string
    updatedAt: string
}

export interface WAAdminResponse {
    logs: WALog[]
    metrics: WAMetrics
    status: WABotStatus
    settings: WASettings
}

export interface WAPagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface WALogsResponse {
    logs: WALog[]
    pagination: WAPagination
}

// Batch update settings request
export interface WABatchUpdateRequest {
    action: 'batch_update_settings'
    settings: Record<WASettingKey, string>
}

export interface WATestMessageRequest {
    action: 'test_cloud_api' | 'test_message'
    phone: string
    value?: string
}
