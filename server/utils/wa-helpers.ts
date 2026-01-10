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
    'wa_bot_last_seen'
] as const

export type WASettingKey = typeof ALLOWED_WA_SETTINGS[number]

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
    hasToken?: boolean  // Flag to indicate if token exists (without exposing it)
}

export interface WAMetrics {
    pending: number
    sent: number
    failed: number
}

export interface WABotStatus {
    lastSeen: string | null
    isOnline: boolean
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
