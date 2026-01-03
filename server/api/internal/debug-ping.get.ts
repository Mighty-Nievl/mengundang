import { db } from '../../utils/db'
import { users } from '../../db/schema'
import { count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    let dbStatus = "unknown"
    let bindingStatus = "unknown"

    try {
        const binding = event.context.cloudflare?.env?.DB;
        bindingStatus = binding ? "Found" : "Missing";

        if (!binding) {
            const keys = Object.keys(event.context);
            const cloudflareKeys = event.context.cloudflare ? Object.keys(event.context.cloudflare) : [];
            const envKeys = event.context.cloudflare?.env ? Object.keys(event.context.cloudflare.env) : [];

            return {
                success: false,
                message: "DB Binding Missing",
                diagnostic: {
                    keys,
                    cloudflareKeys,
                    envKeys
                }
            }
        }

        // Try a simple query
        const result = await db.select({ count: count() }).from(users);
        dbStatus = `Connected, users: ${result[0].count}`;
    } catch (e: any) {
        dbStatus = `Error: ${e.message}`;
        console.error(e);
    }

    return {
        success: true,
        message: 'Pong',
        timestamp: new Date().toISOString(),
        dbStatus,
        bindingStatus
    }
})
