import { db } from '../utils/db'
import { invitations } from '../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Lightweight API endpoint for SEO metadata only.
 * This endpoint is designed to be called server-side during SSR
 * to provide Open Graph metadata for social sharing previews.
 */

// Helper to get proxied image URL for Google Drive
function getProxiedImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'https://mengundang.site/cover.png'

    // If it's a Google Drive URL, proxy it through our endpoint
    if (imageUrl.includes('drive.google.com') || imageUrl.includes('googleusercontent.com')) {
        return `https://mengundang.site/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
    }

    // Otherwise return as-is
    return imageUrl
}

export default defineEventHandler(async (event) => {
    try {
        // Force rebuild timestamp: 2026-01-15 01:50
        const query = getQuery(event)
        const slug = query.slug as string

        if (!slug) {
            throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
        }

        // Validate slug (security)
        if (!/^[a-z0-9-]+$/.test(slug)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid Slug' })
        }

        // Fetch invitation content only (no auth needed for SEO)
        const [result] = await db.select({
            content: invitations.content,
        })
            .from(invitations)
            .where(eq(invitations.slug, slug))

        if (!result) {
            return {
                title: 'Undangan Digital Premium | Mengundang',
                description: 'Website undangan pernikahan digital premium.',
                image: 'https://mengundang.site/cover.png',
            }
        }

        const content = result.content as any

        // Extract SEO metadata from content
        const groomNickname = content?.hero?.groomNickname || 'Groom'
        const brideNickname = content?.hero?.brideNickname || 'Bride'
        const defaultTitle = `Pernikahan ${groomNickname} & ${brideNickname}`

        // Get the image URL and proxy if it's a Google Drive link
        const rawImageUrl = content?.meta?.image || content?.cover?.backgroundImage || content?.hero?.backgroundImage || ''
        const proxiedImageUrl = getProxiedImageUrl(rawImageUrl)

        return {
            title: content?.meta?.title || defaultTitle,
            description: content?.meta?.description || `Kami mengundang Anda untuk hadir di pernikahan ${groomNickname} & ${brideNickname}.`,
            image: proxiedImageUrl,
            // Additional data for OG Image generation
            groomName: groomNickname,
            brideName: brideNickname,
            weddingDate: content?.events?.akad?.date || content?.events?.resepsi?.date || '',
        }
    } catch (e: any) {
        console.error('[seo-meta] ERROR:', e)
        return {
            title: 'Undangan Digital Premium | Mengundang',
            description: 'Website undangan pernikahan digital premium.',
            image: 'https://mengundang.site/cover.png',
        }
    }
})
