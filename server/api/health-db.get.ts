import { db } from "../utils/db";
import * as schema from "../db/schema";
import { sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    try {
        console.log("[Health] Checking DB connectivity...");
        const result = await db.run(sql`SELECT 1`);

        // Try to check tables
        const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);

        return {
            status: "ok",
            message: "Database connected",
            result,
            tables: tables,
            cloudflare: !!event.context.cloudflare,
            envKeys: event.context.cloudflare ? Object.keys(event.context.cloudflare.env) : []
        };
    } catch (e: any) {
        console.error("[Health] DB Check Failed:", e);
        return {
            status: "error",
            message: e.message,
            stack: e.stack,
            cloudflare: !!event.context.cloudflare,
            envKeys: event.context.cloudflare ? Object.keys(event.context.cloudflare.env) : []
        };
    }
});
