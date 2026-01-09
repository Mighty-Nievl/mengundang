import { db } from '../../utils/db'
import { waNotifications, invitations } from '../../db/schema'
import { eq, desc, count, and, like } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. Auth Check
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const query = getQuery(event)
    const slug = query.slug as string

    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Missing slug parameter' })
    }

    // 2. Verify ownership
    const [invitation] = await db.select()
        .from(invitations)
        .where(eq(invitations.slug, slug))
        .limit(1)

    if (!invitation) {
        throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }

    if (invitation.owner !== user.id && invitation.partnerEmail !== user.email) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    try {
        // 3. Fetch logs for this invitation (by matching link pattern)
        const baseUrl = process.env.BETTER_AUTH_URL || 'https://mengundang.site'
        const linkPattern = `%${baseUrl}/${slug}%`

        const logs = await db.select()
            .from(waNotifications)
            .where(like(waNotifications.message, linkPattern))
            .orderBy(desc(waNotifications.createdAt))
            .limit(50)

        // 4. Fetch stats
        const [pendingCount] = await db.select({ val: count() })
            .from(waNotifications)
            .where(and(
                like(waNotifications.message, linkPattern),
                eq(waNotifications.status, 'pending')
            ))

        const [sentCount] = await db.select({ val: count() })
            .from(waNotifications)
            .where(and(
                like(waNotifications.message, linkPattern),
                eq(waNotifications.status, 'sent')
            ))

        // 5. Get template (from invitation content or default)
        const content = invitation.content as any || {}
        const defaultTemplate = `Halo {{name}}! ✨

Tanpa mengurangi rasa hormat, perkenankan kami mengundang bapak/ibu/saudara/i untuk hadir di acara pernikahan kami.

Detail undangan dapat dilihat pada link di bawah ini:
{{link}}

Merupakan suatu kebahagiaan bagi kami apabila bapak/ibu/saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih. 🙏`

        return {
            logs,
            template: content.waTemplate || defaultTemplate,
            stats: {
                pending: pendingCount?.val || 0,
                sent: sentCount?.val || 0
            }
        }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
