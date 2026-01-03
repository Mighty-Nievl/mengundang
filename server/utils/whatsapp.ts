import { sendWhatsAppMessage as sendCloudMessage } from './whatsapp-cloud';
import { db } from './db';
import { waNotifications } from '../db/schema';
import { nanoid } from 'nanoid';

export const sendWhatsAppNotification = async (message: string, to: string, plan: string = 'regular') => {
    const isAdmin = to === process.env.WHATSAPP_TARGET_PHONE || to === '6285946001116';
    const isVVIP = plan.toLowerCase() === 'vvip';

    console.log(`[WhatsAppRouter] Routing message to ${to} (Plan: ${plan})`);

    let summary = { cloud: false, queued: false };

    // 1. Official Cloud API (Admin and VVIP)
    // This runs directly on Cloudflare
    if (isAdmin || isVVIP) {
        try {
            summary.cloud = await sendCloudMessage(message, to);
        } catch (e) {
            console.error('[WhatsAppRouter] Cloud API failed:', e);
        }
    }

    // 2. Queue for Local Bot (Regular, VIP, and Admin backup)
    // Saved to D1, CasaOS Worker will poll this
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
