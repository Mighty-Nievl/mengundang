
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    try {
        console.log('[Debug-Auth] Handler Start')
        // Force initialization of auth
        const isInit = !!auth.api
        console.log('[Debug-Auth] Auth Proxy Accessed. Init:', isInit)

        return {
            status: 'success',
            message: 'Auth initialized properly'
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
