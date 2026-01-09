import { db } from '../../utils/db'
import { waNotifications, systemSettings } from '../../db/schema'
import { desc, eq, count, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. Auth Check (Admin Only)
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']

    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    try {
        // 2. Fetch Logs safely
        let logs = []
        try {
            logs = await db.select()
                .from(waNotifications)
                .orderBy(desc(waNotifications.createdAt))
                .limit(50)
        } catch (dbErr) {
            console.error('[WhatsAppAdmin] Logs fetch failed:', dbErr)
        }

        // 3. Fetch Metrics safely
        let metrics = { pending: 0, sent: 0, failed: 0 }
        try {
            const [p] = await db.select({ val: count() }).from(waNotifications).where(eq(waNotifications.status, 'pending'))
            const [s] = await db.select({ val: count() }).from(waNotifications).where(eq(waNotifications.status, 'sent'))
            const [f] = await db.select({ val: count() }).from(waNotifications).where(eq(waNotifications.status, 'failed'))
            metrics = {
                pending: p?.val || 0,
                sent: s?.val || 0,
                failed: f?.val || 0
            }
        } catch (dbErr) {
            console.error('[WhatsAppAdmin] Metrics fetch failed:', dbErr)
        }

        // 4. Fetch Bot Status & Settings
        let settings: any[] = []
        try {
            settings = await db.select().from(systemSettings)
        } catch (dbErr) {
            console.error('[WhatsAppAdmin] Settings fetch failed:', dbErr)
        }

        const findSetting = (key: string) => settings.find((s: any) => s.key === key)?.value || ''

        const lastSeen = findSetting('wa_bot_last_seen')
        const template = findSetting('wa_invitation_template')

        // Cloud API Settings
        const cloudToken = findSetting('wa_cloud_token')
        const cloudPhoneId = findSetting('wa_cloud_phone_id')
        const cloudWabaId = findSetting('wa_cloud_waba_id')
        const targetPhone = findSetting('wa_target_phone')

        return {
            logs,
            metrics,
            status: {
                lastSeen,
                isOnline: lastSeen ? (new Date().getTime() - new Date(lastSeen).getTime() < 120000) : false
            },
            settings: {
                template,
                cloudToken,
                cloudPhoneId,
                cloudWabaId,
                targetPhone
            }
        }
    } catch (e: any) {
        console.error('[WhatsAppAdmin] Fatal Error:', e)
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error: ' + e.message })
    }
})
