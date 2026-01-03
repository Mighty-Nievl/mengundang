export default defineEventHandler((event) => {
    const config = useRuntimeConfig()

    // Check if configured
    if (!config.googleClientId) {
        throw createError({ statusCode: 500, statusMessage: 'Google Client ID not configured' })
    }

    const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
    const REDIRECT_URI = `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/google/callback`

    const params = new URLSearchParams({
        client_id: config.googleClientId,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'email profile',
        access_type: 'online',
        prompt: 'consent'
    })

    return sendRedirect(event, `${GOOGLE_AUTH_URL}?${params.toString()}`)
})
