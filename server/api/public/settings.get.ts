import { db } from '../../utils/db'
import { systemSettings } from '../../db/schema'
import { inArray } from 'drizzle-orm'

// Public settings endpoint - no auth required
// Only exposes settings that are safe for public access
export default defineEventHandler(async (event) => {
    // Define which settings are safe to expose publicly
    const publicSettingKeys = ['upgrade_enabled', 'maintenance_mode']

    try {
        const settings = await db.select()
            .from(systemSettings)
            .where(inArray(systemSettings.key, publicSettingKeys))
            .all()

        // Convert array to object for easier frontend consumption
        const settingsMap = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)

        return settingsMap
    } catch (e: any) {
        console.error('Failed to fetch public settings:', e)
        // Return safe defaults on error
        return {
            upgrade_enabled: 'true',
            maintenance_mode: 'false'
        }
    }
})
