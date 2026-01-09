import { db } from '../../../utils/db';
import { waNotifications, systemSettings } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. Security Check
    console.log('[API] Poll endpoint accessed');
    const config = useRuntimeConfig();
    const secret = getHeader(event, 'x-api-secret');

    if (secret !== config.internalApiSecret) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // Update Heartbeat
    try {
        await db.insert(systemSettings).values({
            key: 'wa_bot_last_seen',
            value: new Date().toISOString(),
            updatedAt: new Date()
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value: new Date().toISOString(), updatedAt: new Date() }
        });
    } catch (e) {
        console.error('[API] Heartbeat update failed:', e);
    }

    // 2. Fetch Pending Notifications
    try {
        const pending = await db.select()
            .from(waNotifications)
            .where(eq(waNotifications.status, 'pending'))
            .limit(10); // Batch process

        return {
            success: true,
            data: pending
        };
    } catch (e: any) {
        return {
            success: false,
            error: e.message
        };
    }
});
