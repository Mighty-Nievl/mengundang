import { drizzle } from 'drizzle-orm/d1'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const contextKeys = Object.keys(event.context)
    const cloudflare = event.context.cloudflare
    const env = cloudflare?.env
    const binding = env?.DB

    // Check if we are in local dev or production logic
    const processEnvDB = process.env.DB ? 'Used (Local)' : 'Not Set'

    let dbStatus = 'initializing'
    let queryResult = null
    let error = null
    let bindingType = typeof binding

    try {
        if (binding) {
            const db = drizzle(binding)
            // Simple query to verify connection
            const result = await db.run(sql`SELECT 1 as val`)
            dbStatus = 'connected'
            queryResult = result
        } else {
            dbStatus = 'missing_binding'
        }
    } catch (e: any) {
        dbStatus = 'error'
        error = {
            message: e.message,
            stack: e.stack
        }
    }

    return {
        environment: {
            nitroPreset: process.env.NITRO_PRESET,
            nodeEnv: process.env.NODE_ENV,
        },
        cloudflareContext: {
            exists: !!cloudflare,
            envKeys: env ? Object.keys(env) : [],
            hasDBBinding: !!binding,
            bindingType
        },
        dbCheck: {
            processEnvDB,
            dbStatus,
            queryResult,
            error
        }
    }
})
