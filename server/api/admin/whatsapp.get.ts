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
        // 2. Fetch Stats
        const logs = await db.select()
            .from(waNotifications)
            .orderBy(desc(waNotifications.createdAt))
            .limit(50)

        // 3. Fetch Metrics
        const [pendingCount] = await db.select({ val: count() }).from(waNotifications).where(eq(waNotifications.status, 'pending'))
        const [sentCount] = await db.select({ val: count() }).from(waNotifications).where(eq(waNotifications.status, 'sent'))
        const [failedCount] = await db.select({ val: count() }).from(waNotifications).where(eq(waNotifications.status, 'failed'))

        // 4. Fetch Bot Status & Settings
        const settings = await db.select().from(systemSettings)
        const lastSeen = settings.find((s: { key: string }) => s.key === 'wa_bot_last_seen')?.value
        const template = settings.find((s: { key: string }) => s.key === 'wa_invitation_template')?.value

        // Cloud API Settings
        const cloudToken = settings.find((s: { key: string }) => s.key === 'wa_cloud_token')?.value || ''
        const cloudPhoneId = settings.find((s: { key: string }) => s.key === 'wa_cloud_phone_id')?.value || ''
        const cloudWabaId = settings.find((s: { key: string }) => s.key === 'wa_cloud_waba_id')?.value || ''
        const targetPhone = settings.find((s: { key: string }) => s.key === 'wa_target_phone')?.value || ''

        return {
            logs,
            metrics: {
                pending: pendingCount?.val || 0,
                sent: sentCount?.val || 0,
                failed: failedCount?.val || 0
            },
            status: {
                lastSeen,
                isOnline: lastSeen ? (new Date().getTime() - new Date(lastSeen).getTime() < 120000) : false // 2 minutes window
            },
            settings: {
                template: template || '',
                cloudToken,
                cloudPhoneId,
                cloudWabaId,
                targetPhone
            }
        }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
