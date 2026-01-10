import { sendWhatsAppMessage as sendCloudMessage } from './whatsapp-cloud'
import { db } from './db'
import { waNotifications, systemSettings } from '../db/schema'
import { nanoid } from 'nanoid'
import { formatPhoneNumber } from './wa-helpers'

interface WASendResult {
    cloud: boolean | string
    queued: boolean
}

export const sendWhatsAppNotification = async (
    message: string,
    to: string,
    plan: string = 'regular'
): Promise<WASendResult> => {
    // 1. Fetch Admin Phone from DB
    let adminPhone = ''
    try {
        const settings = await db.select().from(systemSettings)
        const dbAdminPhone = settings.find((s: any) => s.key === 'wa_target_phone')?.value
        if (dbAdminPhone) adminPhone = formatPhoneNumber(dbAdminPhone)
    } catch (e) {
        console.warn('[WhatsAppRouter] Could not fetch settings from DB')
    }

    const formattedTo = formatPhoneNumber(to)
    const isAdmin = adminPhone && formattedTo === adminPhone
    const isVVIP = plan.toLowerCase() === 'vvip' || plan.toLowerCase() === 'official'

    console.log(`[WhatsAppRouter] Routing message to ${formattedTo} (Plan: ${plan}, IsAdmin: ${isAdmin})`)

    let summary: WASendResult = { cloud: false, queued: false }

    // 2. Official Cloud API (Admin and VVIP/Official Plan)
    if (isAdmin || isVVIP) {
        try {
            summary.cloud = await sendCloudMessage(message, formattedTo)
        } catch (e) {
            console.error('[WhatsAppRouter] Cloud API failed:', e)
        }
    }

    // 3. Queue for Local Bot (Regular, VIP, and Admin backup)
    if (isAdmin || !isVVIP) {
        try {
            await db.insert(waNotifications).values({
                id: nanoid(),
                phoneNumber: formattedTo,
                message: message,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            })
            summary.queued = true
            console.log(`[WhatsAppRouter] Message queued for Local Bot (To: ${formattedTo})`)
        } catch (e) {
            console.error('[WhatsAppRouter] Failed to queue message:', e)
        }
    }

    return summary
}
