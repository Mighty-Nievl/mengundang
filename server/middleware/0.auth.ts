
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
    if (
        path.startsWith('/_nuxt') ||
        path.startsWith('/favicon') ||
        path.startsWith('/api/webhooks') ||
        path.startsWith('/api/internal')
    ) {
        return
    }

    const session = await auth.api.getSession({
        headers: event.headers
    })

    if (session) {
        event.context.user = session.user
        event.context.session = session.session
    }
})
