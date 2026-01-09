import { sendWhatsAppMessage as sendCloudMessage } from './whatsapp-cloud';
import { db } from './db';
import { waNotifications, systemSettings } from '../db/schema';
import { nanoid } from 'nanoid';

export const sendWhatsAppNotification = async (message: string, to: string, plan: string = 'regular') => {
    // 1. Fetch Admin Phone from DB
    let adminPhone = process.env.WHATSAPP_TARGET_PHONE || '6285946001116';
    try {
        const settings = await db.select().from(systemSettings)
        const dbAdminPhone = settings.find((s: any) => s.key === 'wa_target_phone')?.value
        if (dbAdminPhone) adminPhone = dbAdminPhone.replace(/\D/g, '')
    } catch (e) {
        console.warn('[WhatsAppRouter] Could not fetch settings from DB, using fallback/env');
    }

    const isAdmin = to.replace(/\D/g, '') === adminPhone.replace(/\D/g, '');
    const isVVIP = plan.toLowerCase() === 'vvip' || plan.toLowerCase() === 'official';

    console.log(`[WhatsAppRouter] Routing message to ${to} (Plan: ${plan}, IsAdmin: ${isAdmin})`);

    let summary = { cloud: false, queued: false };

    // 2. Official Cloud API (Admin and VVIP/Official Plan)
    if (isAdmin || isVVIP) {
        try {
            summary.cloud = await sendCloudMessage(message, to);
        } catch (e) {
            console.error('[WhatsAppRouter] Cloud API failed:', e);
        }
    }

    // 3. Queue for Local Bot (Regular, VIP, and Admin backup)
    // We queue for non-VVIP or as a backup for Admin
    if (isAdmin || !isVVIP) {
        try {
            await db.insert(waNotifications).values({
                id: nanoid(),
                phoneNumber: to,
                message: message,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            summary.queued = true;
            console.log(`[WhatsAppRouter] Message queued for Local Bot (To: ${to})`);
        } catch (e) {
            console.error('[WhatsAppRouter] Failed to queue message:', e);
        }
    }

    return summary;
};
