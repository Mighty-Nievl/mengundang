import { db } from '../utils/db'
import { invitations, users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../utils/auth'
import { PLAN_CONFIGS } from '../utils/plan'
import { InvitationSchema } from '../utils/schemas'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })
    const user = session?.user

    const query = getQuery(event)
    const slug = query.slug as string

    // Validate slug
    const slugResult = z.string().regex(/^[a-z0-9-]+$/, 'Invalid Slug').safeParse(slug)
    if (!slugResult.success) throw createError({ statusCode: 400, statusMessage: slugResult.error.issues[0]?.message })

    // Fetch invitation and owner details
    const [result] = await db.select({
        invitation: invitations,
        owner: users
    })
        .from(invitations)
        .leftJoin(users, eq(invitations.owner, users.email))
        .where(eq(invitations.slug, slug))

    if (!result || !result.invitation) throw createError({ statusCode: 404, statusMessage: 'Invitation Not Found' })
    const { invitation, owner: ownerDetails } = result

    const isAdmin = (user as any)?.role === 'admin'
    const isStaff = (user as any)?.role === 'staff'
    const isSuperuser = (user as any)?.role === 'superuser'
    const isOwner = user && invitation.owner === user.email
    const isPartner = user && invitation.partnerEmail === user.email
    const isAuthorized = isAdmin || isStaff || isSuperuser || isOwner || isPartner

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
            partnerEmail: (isAuthorized && invitation.partnerEmail) ? invitation.partnerEmail : (invitation.partnerEmail ? 'hidden' : null),
            plan: ownerDetails?.plan || 'free' // Expose plan for UI logic
        }

        return response
    }

    if (event.method === 'POST') {
        if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

        if (!isAuthorized) {
            throw createError({ statusCode: 403, statusMessage: 'Anda tidak memiliki akses untuk mengubah undangan ini' })
        }

        const body = await readBody(event)

        // Validate Content Body
        const result_zod = InvitationSchema.pick({ content: true }).safeParse({ content: body })
        if (!result_zod.success) {
            throw createError({ statusCode: 400, statusMessage: 'Format konten tidak valid' })
        }

        // VALIDATE THEME ACCESS
        const targetTheme = body.theme || 'original'
        const userPlan = ownerDetails?.plan || 'free'
        const allowedThemes = PLAN_CONFIGS[userPlan]?.allowedThemes || ['original']

        if (!allowedThemes.includes(targetTheme)) {
            throw createError({
                statusCode: 403,
                statusMessage: `Tema '${targetTheme}' tidak tersedia untuk paket ${PLAN_CONFIGS[userPlan]?.name}. Silakan upgrade paket Anda.`
            })
        }

        await db.update(invitations).set({
            content: body,
            updatedAt: new Date()
        }).where(eq(invitations.slug, slug))

        return { success: true }
    }
})
