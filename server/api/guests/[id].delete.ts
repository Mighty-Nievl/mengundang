import { db } from '../../utils/db'
import { guests, invitations } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    const session = event.context.session

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { id } = event.context.params as { id: string }
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID is required' })
    }

    // Get the guest to find the invitationSlug
    const [guest] = await db.select().from(guests).where(eq(guests.id, id))
    if (!guest) {
        throw createError({ statusCode: 404, statusMessage: 'Guest not found' })
    }

    // Verify ownership of the invitation
    const [inv] = await db.select().from(invitations).where(eq(invitations.slug, guest.invitationSlug))
    if (!inv) {
        // If invitation is gone, allow deletion if admin
        const isAdmin = (user as any).role === 'admin'
        const isSuperuser = (user as any).role === 'superuser'
        if (isAdmin || isSuperuser) {
            await db.delete(guests).where(eq(guests.id, id))
            return { success: true }
        }
        throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }

    const isAdmin = (user as any).role === 'admin'
    const isSuperuser = (user as any).role === 'superuser'
    const isOwner = inv.owner === user.email || inv.partnerEmail === user.email

    if (!isAdmin && !isSuperuser && !isOwner) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    await db.delete(guests).where(eq(guests.id, id))
    return { success: true }
})
