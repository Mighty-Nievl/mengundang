import { db } from '../../../utils/db';
import { waNotifications } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const config = useRuntimeConfig();
    const secret = getHeader(event, 'x-api-secret');

    if (secret !== config.internalApiSecret) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
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
