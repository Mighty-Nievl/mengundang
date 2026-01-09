import { db } from '../../utils/db'
import { waNotifications, systemSettings } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { sendWhatsAppMessage } from '../../utils/whatsapp-cloud'

export default defineEventHandler(async (event) => {
    // 1. Auth Check (Admin Only)
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']

    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    const body = await readBody(event)
    const { action, value, phone, key } = body

    try {
        if (action === 'update_template') {
            await db.insert(systemSettings).values({
                key: 'wa_invitation_template',
                value: value,
                updatedAt: new Date()
            }).onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: value, updatedAt: new Date() }
            })
            return { success: true, message: 'Template updated' }
        }

        if (action === 'update_setting') {
            if (!key) throw createError({ statusCode: 400, statusMessage: 'Key required' })
            await db.insert(systemSettings).values({
                key: key,
                value: String(value),
                updatedAt: new Date()
            }).onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: String(value), updatedAt: new Date() }
            })
            return { success: true, message: 'Setting updated' }
        }

        if (action === 'test_message') {
            if (!phone) throw createError({ statusCode: 400, statusMessage: 'Phone number required' })

            // Format phone
            let formattedPhone = phone.replace(/\D/g, '')
            if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1)

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

        if (action === 'test_cloud_api') {
            if (!phone) throw createError({ statusCode: 400, statusMessage: 'Phone number required' })

            // Format phone
            let formattedPhone = phone.replace(/\D/g, '')
            if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1)

            const msgText = value || 'Test message from WhatsApp Cloud API! 🚀'

            // Log try to DB
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
                await db.update(waNotifications).set({ status: 'sent', updatedAt: new Date() }).where(eq(waNotifications.id, logId))
                return { success: true, message: 'Test message sent via Cloud API' }
            } else {
                const errorMsg = typeof result === 'string' ? result : 'Cloud API failed. Check credentials.'
                await db.update(waNotifications).set({ status: 'failed', updatedAt: new Date() }).where(eq(waNotifications.id, logId))
                throw createError({ statusCode: 500, statusMessage: errorMsg })
            }
        }

        throw createError({ statusCode: 400, statusMessage: 'Invalid action' })
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
