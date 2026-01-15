/**
 * Image Proxy for Google Drive images
 * This endpoint fetches images from Google Drive and serves them directly,
 * bypassing the 302 redirect that social media crawlers can't follow.
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const url = query.url as string

    if (!url) {
        throw createError({ statusCode: 400, statusMessage: 'URL is required' })
    }

    // Only allow Google Drive URLs for security
    if (!url.includes('drive.google.com') && !url.includes('googleusercontent.com')) {
        // If not a Drive URL, redirect to the original
        return sendRedirect(event, url, 302)
    }

    try {
        // Fetch the image from Google Drive
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            },
            redirect: 'follow', // Follow all redirects
        })

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                statusMessage: 'Failed to fetch image from source'
            })
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg'
        const buffer = await response.arrayBuffer()

        // Set cache headers for CDN and browser caching
        setHeaders(event, {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, s-maxage=604800', // 1 day browser, 7 days CDN
            'Access-Control-Allow-Origin': '*',
        })

        return new Uint8Array(buffer)
    } catch (e: any) {
        console.error('[image-proxy] Error:', e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to proxy image'
        })
    }
})
