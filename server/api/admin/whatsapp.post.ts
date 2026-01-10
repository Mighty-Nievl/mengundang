import { db } from '../../utils/db'
import { waNotifications, systemSettings } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { sendWhatsAppMessage } from '../../utils/whatsapp-cloud'
import {
    ALLOWED_WA_SETTINGS,
    formatPhoneNumber,
    isValidPhoneNumber,
    type WASettingKey
} from '../../utils/wa-helpers'

export default defineEventHandler(async (event) => {
    // Auth Check (Admin Only)
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']

    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    const body = await readBody(event)
    const { action } = body

    try {
        // ============================================
        // ACTION: Batch Update Settings (Atomic)
        // ============================================
        if (action === 'batch_update_settings') {
            const { settings } = body as { settings: Record<string, string> }

            if (!settings || typeof settings !== 'object') {
                throw createError({ statusCode: 400, statusMessage: 'Settings object required' })
            }

            const updates: Promise<any>[] = []

            for (const [key, value] of Object.entries(settings)) {
                // SECURITY: Only allow whitelisted keys
                if (!ALLOWED_WA_SETTINGS.includes(key as WASettingKey)) {
                    console.warn(`[WhatsAppAdmin] Rejected invalid setting key: ${key}`)
                    continue
                }

                updates.push(
                    db.insert(systemSettings).values({
                        key: key,
                        value: String(value ?? ''),
                        updatedAt: new Date()
                    }).onConflictDoUpdate({
                        target: systemSettings.key,
                        set: { value: String(value ?? ''), updatedAt: new Date() }
                    })
                )
            }

            // Execute all updates in parallel (atomic-ish)
            await Promise.all(updates)

            return { success: true, message: `${updates.length} settings updated` }
        }

        // ============================================
        // ACTION: Update Single Setting (Legacy)
        // ============================================
        if (action === 'update_setting') {
            const { key, value } = body

            if (!key) {
                throw createError({ statusCode: 400, statusMessage: 'Key required' })
            }

            // SECURITY: Whitelist validation
            if (!ALLOWED_WA_SETTINGS.includes(key as WASettingKey)) {
                throw createError({ statusCode: 400, statusMessage: `Invalid setting key: ${key}` })
            }

            await db.insert(systemSettings).values({
                key: key,
                value: String(value ?? ''),
                updatedAt: new Date()
            }).onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: String(value ?? ''), updatedAt: new Date() }
            })

            return { success: true, message: 'Setting updated' }
        }

        // ============================================
        // ACTION: Update Template (Legacy shorthand)
        // ============================================
        if (action === 'update_template') {
            const { value } = body

            await db.insert(systemSettings).values({
                key: 'wa_invitation_template',
                value: String(value ?? ''),
                updatedAt: new Date()
            }).onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: String(value ?? ''), updatedAt: new Date() }
            })

            return { success: true, message: 'Template updated' }
        }

        // ============================================
        // ACTION: Test Message (Queue for Local Bot)
        // ============================================
        if (action === 'test_message') {
            const { phone, value } = body

            if (!phone) {
                throw createError({ statusCode: 400, statusMessage: 'Phone number required' })
            }

            const formattedPhone = formatPhoneNumber(phone)

            if (!isValidPhoneNumber(formattedPhone)) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid phone number format' })
            }

            await db.insert(waNotifications).values({
                id: nanoid(),
                phoneNumber: formattedPhone,
                message: value || 'Test message from WhatsApp CMS! 🤖',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            })

            return { success: true, message: 'Test message queued for Local Bot' }
        }

        // ============================================
        // ACTION: Test Cloud API (Direct send)
        // ============================================
        if (action === 'test_cloud_api') {
            const { phone, value } = body

            if (!phone) {
                throw createError({ statusCode: 400, statusMessage: 'Phone number required' })
            }

            const formattedPhone = formatPhoneNumber(phone)

            if (!isValidPhoneNumber(formattedPhone)) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid phone number format' })
            }

            const msgText = value || 'Test message from WhatsApp Cloud API! 🚀'

            // Log attempt to DB
            const logId = nanoid()
            await db.insert(waNotifications).values({
                id: logId,
                phoneNumber: formattedPhone,
                message: `[Cloud API] ${msgText}`,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            })

            const result = await sendWhatsAppMessage(msgText, formattedPhone)

            if (result === true) {
                await db.update(waNotifications)
                    .set({ status: 'sent', updatedAt: new Date() })
                    .where(eq(waNotifications.id, logId))
                return { success: true, message: 'Test message sent via Cloud API' }
            } else {
                const errorMsg = typeof result === 'string' ? result : 'Cloud API failed. Check credentials.'
                await db.update(waNotifications)
                    .set({ status: 'failed', updatedAt: new Date() })
                    .where(eq(waNotifications.id, logId))
                // Use 502 for upstream API errors
                throw createError({ statusCode: 502, statusMessage: errorMsg })
            }
        }

        // ============================================
        // ACTION: Test Template (Send sample notification)
        // ============================================
        if (action === 'test_template') {
            const { type, phone } = body

            if (!phone) {
                throw createError({ statusCode: 400, statusMessage: 'Phone number required' })
            }
            if (!type || !['order_new', 'order_approved', 'payout_request', 'payout_processed'].includes(type)) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid template type' })
            }

            const formattedPhone = formatPhoneNumber(phone)
            if (!isValidPhoneNumber(formattedPhone)) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid phone number' })
            }

            // Import helpers
            const { DEFAULT_TEMPLATES, renderTemplate } = await import('../../utils/wa-helpers')

            // Fetch custom template from DB
            const templateKey = `wa_tpl_${type}`
            const [customTpl] = await db.select().from(systemSettings).where(eq(systemSettings.key, templateKey)).limit(1)
            const templateStr = customTpl?.value || DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES]

            // Sample data for testing
            const sampleData: Record<string, string> = {
                name: 'John Doe',
                email: 'john@example.com',
                plan: 'VIP',
                amount: 'Rp 99.000',
                admin: user?.name || 'Admin',
                bank: 'BCA',
                account: '1234567890',
                account_name: 'John Doe',
                phone: '08123456789'
            }

            const renderedMsg = renderTemplate(templateStr, sampleData)

            // Send via Cloud API
            const result = await sendWhatsAppMessage(formattedPhone, renderedMsg)
            if (result === true) {
                return { success: true, message: `Test ${type} sent!` }
            } else {
                throw createError({ statusCode: 502, statusMessage: result || 'Failed to send' })
            }
        }

        // Unknown action
        throw createError({ statusCode: 400, statusMessage: `Invalid action: ${action}` })

    } catch (e: any) {
        // Re-throw if it's already a H3 error
        if (e.statusCode) throw e

        // Log unexpected errors
        console.error('[WhatsAppAdmin] Unexpected error:', e)
        throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
    }
})
