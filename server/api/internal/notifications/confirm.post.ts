import { db } from '../../../utils/db';
import { waNotifications } from '../../../db/schema';
import { eq, inArray } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const config = useRuntimeConfig();
    const secret = getHeader(event, 'x-api-secret');

    if (secret !== config.internalApiSecret) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // 2. Mark as Sent
    try {
        const body = await readBody(event);
        const { ids, status = 'sent' } = body;

        if (!ids || !Array.isArray(ids)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid body' });
        }

        await db.update(waNotifications)
            .set({
                status: status,
                updatedAt: new Date()
            })
            .where(inArray(waNotifications.id, ids));

        return {
            success: true
        };
    } catch (e: any) {
        return {
            success: false,
            error: e.message
        };
    }
});
