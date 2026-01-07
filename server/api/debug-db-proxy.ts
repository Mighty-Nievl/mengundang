import { db } from '../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    let status = 'init'
    let dbType = typeof db
    let queryResult = null
    let error = null

    try {
        console.log('[debug-db-proxy] Testing db proxy...')
        // Check if db is defined (it's a proxy, so it always is, but let's check props)
        if (!db) {
            status = 'db_export_undefined'
        } else {
            status = 'db_defined'

            // Try a simple query
            console.log('[debug-db-proxy] Running query...')
            queryResult = await db.run(sql`SELECT 1 as val`)
            status = 'query_success'
        }
    } catch (e: any) {
        console.error('[debug-db-proxy] Error:', e)
        status = 'error'
        error = {
            message: e.message,
            stack: e.stack,
            name: e.name
        }
    }

    return {
        status,
        dbType,
        queryResult,
        error
    }
})
