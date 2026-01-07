import { db } from '../utils/db'
import { invitations, users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../utils/auth'

// ... imports
export default defineEventHandler(async (event) => {
    try {
        const user = event.context.user
        console.log('[v2-content] Start', { user })

        const query = getQuery(event)
        const slug = query.slug as string
        console.log('[v2-content] Slug:', slug)

        if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required' })

        // Validate slug (security)
        if (!/^[a-z0-9-]+$/.test(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid Slug' })

        // Fetch invitation and owner details
        console.log('[v2-content] Executing Query...')
        const [result] = await db.select({
            invitation: invitations,
            owner: users
        })
            .from(invitations)
            .leftJoin(users, eq(invitations.owner, users.email))
            .where(eq(invitations.slug, slug))

        console.log('[v2-content] Query Result:', result ? 'Found' : 'Null')

        if (!result || !result.invitation) throw createError({ statusCode: 404, statusMessage: 'Invitation Not Found' })
        const { invitation, owner: ownerDetails } = result

        const isAdmin = (user as any)?.role === 'admin'
        const isStaff = (user as any)?.role === 'staff'
        const isOwner = user && invitation.owner === user.email
        const isPartner = user && invitation.partnerEmail === user.email
        const isAuthorized = isAdmin || isStaff || isOwner || isPartner
        console.log('[v2-content] Auth Check:', { isAuthorized, owner: invitation.owner })

        // EXPIRE CHECK
        if (!isAuthorized && ownerDetails?.planExpiresAt) {
            if (new Date() > new Date(ownerDetails.planExpiresAt)) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'Masa aktif undangan ini telah berakhir. Silakan hubungi admin untuk aktivasi kembali.'
                })
            }
        }

        if (event.method === 'GET') {
            // Return content + authorization flag
            const response: any = {
                ...(invitation.content as any || {}),
            }

            // Add auth metadata - hide emails if not authorized to see them
            response._auth = {
                isAuthorized,
                owner: isAuthorized ? invitation.owner : 'hidden',
                partnerEmail: (isAuthorized && invitation.partnerEmail) ? invitation.partnerEmail : (invitation.partnerEmail ? 'hidden' : null)
            }

            return response
        }

        if (event.method === 'POST') {
            if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

            if (!isAuthorized) {
                throw createError({ statusCode: 403, statusMessage: 'Anda tidak memiliki akses untuk mengubah undangan ini' })
            }

            const body = await readBody(event)

            await db.update(invitations).set({
                content: body,
                updatedAt: new Date()
            }).where(eq(invitations.slug, slug))

            return { success: true }
        }
    } catch (e: any) {
        console.error('[v2-content] ERROR:', e)
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || 'Internal Server Error',
            data: e.message
        })
    }
})
