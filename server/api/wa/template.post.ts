import { db } from '../../utils/db'
import { invitations } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. Auth Check
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { slug, template } = body

    if (!slug || !template) {
        throw createError({ statusCode: 400, statusMessage: 'Missing slug or template' })
    }

    // 2. Verify ownership
    const [invitation] = await db.select()
        .from(invitations)
        .where(eq(invitations.slug, slug))
        .limit(1)

    if (!invitation) {
        throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }

    if (invitation.owner !== user.email && invitation.partnerEmail !== user.email) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    try {
        // 3. Update invitation content with waTemplate
        const content = (invitation.content as any) || {}
        content.waTemplate = template

        await db.update(invitations)
            .set({
                content: content,
                updatedAt: new Date()
            })
            .where(eq(invitations.slug, slug))

        return { success: true, message: 'Template saved' }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
