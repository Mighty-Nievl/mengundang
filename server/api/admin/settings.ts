import { db } from '../../utils/db'
import { systemSettings } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. Auth Check (Admin Only)
    const session = await getSession(event)
    if (!session || session.user.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    const method = event.method

    if (method === 'GET') {
        const settings = await db.select().from(systemSettings)
        // Convert array to object for easier frontend consumption
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)
        return settingsMap
    }

    if (method === 'POST') {
        const body = await readBody(event)
        const { key, value } = body

        if (!key || value === undefined) {
            throw createError({ statusCode: 400, statusMessage: 'Key and Value required' })
        }

        // Upsert logic
        const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).get()

        if (existing) {
            await db.update(systemSettings)
                .set({ value: String(value), updatedAt: new Date() })
                .where(eq(systemSettings.key, key))
        } else {
            await db.insert(systemSettings).values({
                key,
                value: String(value),
                updatedAt: new Date()
            })
        }

        return { success: true }
    }
})

// Helper to get session (since we removed context.session reliance for standard middleware? 
// No, context.user is set by auth middleware for standard routes, but better safe with getSession check here or context)
async function getSession(event: any) {
    // Re-use logic or rely on context if middleware is robust. 
    // Given previous context cleanup, we can check event.context.user
    if (event.context.user) return { user: event.context.user }

    // Fallback to internal better auth check if needed, but context is preferred now
    return null
}
