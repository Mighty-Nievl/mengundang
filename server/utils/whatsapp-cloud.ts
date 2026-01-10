import { db } from './db'
import { systemSettings } from '../db/schema'
import { eq } from 'drizzle-orm'
import { formatPhoneNumber } from './wa-helpers'

// Helper to get setting from DB or ENV
async function getSetting(key: string, envKey: string, defaultValue: string = ''): Promise<string> {
    try {
        const setting = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).get()
        return setting?.value || process.env[envKey] || defaultValue
    } catch (e) {
        console.error(`[WhatsAppCloud] Failed to fetch setting ${key}:`, e)
        return process.env[envKey] || defaultValue
    }
}

export const sendWhatsAppMessage = async (message: string, toPhone?: string): Promise<boolean | string> => {
    // 1. Resolve Config (DB first, then ENV)
    const TOKEN = await getSetting('wa_cloud_token', 'WHATSAPP_TOKEN')
    const PHONE_ID = await getSetting('wa_cloud_phone_id', 'WHATSAPP_PHONE_ID')
    const TARGET_PHONE = await getSetting('wa_target_phone', 'WHATSAPP_TARGET_PHONE')

    // Format the target phone number
    const rawTarget = toPhone || TARGET_PHONE
    if (!rawTarget) {
        console.warn("[WhatsAppCloud] No target phone number provided")
        return 'No target phone number provided'
    }

    const target = formatPhoneNumber(rawTarget)

    if (!TOKEN || !PHONE_ID) {
        console.warn("[WhatsAppCloud] Missing credentials (WA_CLOUD_TOKEN or WA_CLOUD_PHONE_ID)")
        return 'Missing WhatsApp Cloud API credentials'
    }

    try {
        const url = `https://graph.facebook.com/v21.0/${PHONE_ID}/messages`

        const payload = {
            messaging_product: "whatsapp",
            to: target,
            type: "text",
            text: { body: message }
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json() as any

        if (!response.ok) {
            const errMsg = data?.error?.message || `API Error ${response.status}`
            console.error("[WhatsAppCloud] API Error:", errMsg, data)
            return errMsg
        }

        console.log(`[WhatsAppCloud] Message sent to ${target}`)
        return true

    } catch (error: any) {
        console.error("[WhatsAppCloud] Network Error:", error)
        return `Network Error: ${error.message}`
    }
}
