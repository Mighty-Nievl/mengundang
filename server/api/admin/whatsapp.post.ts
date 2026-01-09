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

            const success = await sendWhatsAppMessage(value || 'Test message from WhatsApp Cloud API! 🚀', formattedPhone)

            if (success) {
                return { success: true, message: 'Test message sent via Cloud API' }
            } else {
                throw createError({ statusCode: 500, statusMessage: 'Cloud API failed. Check logs/credentials.' })
            }
        }

        throw createError({ statusCode: 400, statusMessage: 'Invalid action' })
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
