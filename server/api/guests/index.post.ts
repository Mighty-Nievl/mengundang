import { db } from '../../utils/db'
import { guests, invitations } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '../../utils/auth'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { id, invitationSlug, name, phoneNumber, note } = body

    if (!invitationSlug || !name) {
        throw createError({ statusCode: 400, statusMessage: 'Invitation Slug and Name are required' })
    }

    // Verify ownership
    const [inv] = await db.select().from(invitations).where(eq(invitations.slug, invitationSlug))
    if (!inv) {
        throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }

    const isAdmin = (user as any).role === 'admin' || (user as any).role === 'superuser'
    const isOwner = inv.owner === user.email || inv.partnerEmail === user.email

    if (!isAdmin && !isOwner) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    if (id) {
        // Update
        await db.update(guests).set({
            name,
            phoneNumber,
            note,
            updatedAt: new Date()
        }).where(eq(guests.id, id))
        return { success: true, id }
    } else {
        // Create
        const newId = uuidv4()
        await db.insert(guests).values({
            id: newId,
            invitationSlug,
            name,
            phoneNumber,
            note,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        return { success: true, id: newId }
    }
})
