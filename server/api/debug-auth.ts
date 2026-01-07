import { auth } from '../utils/auth'
import { db } from '../utils/db'
import { users } from '../db/schema'

export default defineEventHandler(async (event) => {
    try {
        console.log('[Debug-Auth] Handler Start')
        // Force initialization of auth
        const isInit = !!auth.api
        console.log('[Debug-Auth] Auth Proxy Accessed. Init:', isInit)

        // Test DB Query via Proxy
        const allUsers = await db.select().from(users).limit(1)
        console.log('[Debug-Auth] DB Query Success. First user found:', !!allUsers.length)

        return {
            status: 'success',
            message: 'Auth initialized & DB Query successful',
            dbCheck: !!allUsers
        }
    } catch (e: any) {
        console.error('[Debug-Auth] Error:', e)
        return {
            status: 'error',
            message: e.message,
            stack: e.stack
        }
    }
})
console.error('[Debug-Auth] Error:', e)
return {
    status: 'error',
    message: e.message,
    stack: e.stack
}
    }
})
