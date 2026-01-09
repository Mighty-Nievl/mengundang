
import { auth } from '../utils/auth'

export default defineEventHandler(async (event) => {
    // Skip session check for static assets and public routes
    const path = event.path

    // 1. Static Asset Extensions
    const staticExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp', '.avif', '.woff', '.woff2', '.ttf', '.otf', '.css', '.js', '.map']
    if (staticExtensions.some(ext => path.toLowerCase().endsWith(ext))) {
        return
    }

    // 2. Specific Public Paths
    const cleanPath = path.split('?')[0]
    if (
        cleanPath === '/' ||
        cleanPath.startsWith('/_nuxt') ||
        cleanPath.startsWith('/favicon') ||
        cleanPath.startsWith('/api/webhooks') ||
        cleanPath.startsWith('/api/internal') ||
        cleanPath.startsWith('/login') ||
        cleanPath.startsWith('/register')
    ) {
        return
    }

    try {
        const session = await auth.api.getSession({
            headers: event.headers
        })

        if (session) {
            event.context.user = session.user
            event.context.session = session.session
        }
    } catch (e: any) {
        console.error("Auth Middleware Error:", e);
        // Return 500 with error details for debugging
        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error (Auth)",
            message: e.message,
            stack: e.stack,
            data: {
                cause: e.cause
            }
        });
    }
})
