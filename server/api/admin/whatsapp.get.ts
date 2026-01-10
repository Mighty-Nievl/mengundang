import { db } from '../../utils/db'
import { waNotifications, systemSettings } from '../../db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { maskSensitiveData, type WAAdminResponse, type WAMetrics } from '../../utils/wa-helpers'

export default defineEventHandler(async (event): Promise<WAAdminResponse> => {
    // Auth Check (Admin Only)
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']

    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    try {
        // 1. Fetch recent logs
        let logs: any[] = []
        try {
            logs = await db.select()
                .from(waNotifications)
                .orderBy(desc(waNotifications.createdAt))
                .limit(50)
        } catch (dbErr) {
            console.error('[WhatsAppAdmin] Logs fetch failed:', dbErr)
        }

        // 2. Fetch metrics with single optimized query (GROUP BY)
        let metrics: WAMetrics = { pending: 0, sent: 0, failed: 0 }
        try {
            const metricsResult = await db.select({
                status: waNotifications.status,
                count: sql<number>`count(*)`
            })
                .from(waNotifications)
                .groupBy(waNotifications.status)

            for (const row of metricsResult) {
                if (row.status === 'pending') metrics.pending = row.count
                else if (row.status === 'sent') metrics.sent = row.count
                else if (row.status === 'failed') metrics.failed = row.count
            }
        } catch (dbErr) {
            console.error('[WhatsAppAdmin] Metrics fetch failed:', dbErr)
        }

        // 3. Fetch Settings
        let allSettings: any[] = []
        try {
            allSettings = await db.select().from(systemSettings)
        } catch (dbErr) {
            console.error('[WhatsAppAdmin] Settings fetch failed:', dbErr)
        }

        const findSetting = (key: string) => allSettings.find((s: any) => s.key === key)?.value || ''

        const lastSeen = findSetting('wa_bot_last_seen')
        const template = findSetting('wa_invitation_template')
        const cloudToken = findSetting('wa_cloud_token')
        const cloudPhoneId = findSetting('wa_cloud_phone_id')
        const cloudWabaId = findSetting('wa_cloud_waba_id')
        const targetPhone = findSetting('wa_target_phone')

        return {
            logs,
            metrics,
            status: {
                lastSeen,
                isOnline: lastSeen ? (Date.now() - new Date(lastSeen).getTime() < 120000) : false,
                cloudApiOk: !!cloudToken && !!cloudPhoneId,
                botOnline: lastSeen ? (Date.now() - new Date(lastSeen).getTime() < 120000) : false,
                botLastSeen: lastSeen || null
            },
            settings: {
                template,
                // SECURITY: Never expose full token - only masked version
                cloudToken: maskSensitiveData(cloudToken, 8),
                cloudPhoneId,
                cloudWabaId,
                targetPhone,
                hasToken: !!cloudToken
            }
        }
    } catch (e: any) {
        console.error('[WhatsAppAdmin] Fatal Error:', e)
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
    }
})
