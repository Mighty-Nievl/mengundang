import { db } from '../../utils/db'
import { systemSettings } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { isValidSettingKey } from '../../utils/admin-helpers'

export default defineEventHandler(async (event) => {
    // Auth Check (Admin Only) - using consistent pattern
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']

    if (!user || !allowedRoles.includes((user as any).role)) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    const method = event.method

    // GET: Fetch all settings as key-value object
    if (method === 'GET') {
        try {
            const settings = await db.select().from(systemSettings)
            const settingsMap = settings.reduce((acc, curr) => {
                acc[curr.key] = curr.value
                return acc
            }, {} as Record<string, string>)
            return settingsMap
        } catch (e: any) {
            throw createError({ statusCode: 500, statusMessage: 'Failed to fetch settings' })
        }
    }

    // POST: Update a setting
    if (method === 'POST') {
        const body = await readBody(event)
        const { key, value } = body

        if (!key || value === undefined) {
            throw createError({ statusCode: 400, statusMessage: 'Key and Value required' })
        }

        // SECURITY: Whitelist validation
        if (!isValidSettingKey(key)) {
            throw createError({ statusCode: 400, statusMessage: `Invalid setting key: ${key}` })
        }

        try {
            // Upsert using onConflictDoUpdate
            await db.insert(systemSettings).values({
                key,
                value: String(value),
                updatedAt: new Date()
            }).onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: String(value), updatedAt: new Date() }
            })

            return { success: true }
        } catch (e: any) {
            throw createError({ statusCode: 500, statusMessage: 'Failed to save setting' })
        }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
