import { db } from '../../utils/db'
import { guests, invitations } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { slug } = getQuery(event) as { slug: string }
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
    }

    // Verify ownership of the invitation
    const [inv] = await db.select().from(invitations).where(eq(invitations.slug, slug))
    if (!inv) {
        throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }

    const isAdmin = (user as any).role === 'admin'
    const isOwner = inv.owner === user.email || inv.partnerEmail === user.email

    if (!isAdmin && !isOwner) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // Get guests
    const guestList = await db.select().from(guests).where(eq(guests.invitationSlug, slug))
    return guestList
})
