import { db } from '../utils/db'
import { invitations, users } from '../db/schema'
import { eq, or, and } from 'drizzle-orm'
import { auth } from '../utils/auth'

const RESERVED_SLUGS = ['admin', 'dashboard', 'login', 'register', 'api', 'auth', 'public', 'assets', 'demo']

export default defineEventHandler(async (event) => {
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const isAdmin = (user as any).role === 'admin'
    const isStaff = (user as any).role === 'staff'
    const isSuperuser = (user as any).role === 'superuser'

    // Helper to check ownership or staff/admin bypass
    const isManagerOrOwner = (inv: any) => {
        return isAdmin || isStaff || isSuperuser || inv.owner === user.email || inv.partnerEmail === user.email
    }

    if (event.method === 'GET') {
        const queryBuilder = db.select().from(invitations)

        let allInvitations: any[] = []
        if (isAdmin || isStaff || isSuperuser) {
            allInvitations = await queryBuilder
        } else {
            allInvitations = await queryBuilder.where(
                or(
                    eq(invitations.owner, user.email),
                    eq(invitations.partnerEmail, user.email)
                )
            )
        }

        return allInvitations.map(inv => ({
            slug: inv.slug,
            // @ts-ignore - Content is JSON
            groom: inv.content?.hero?.groomNickname || 'Groom',
            // @ts-ignore
            bride: inv.content?.hero?.brideNickname || 'Bride',
            // @ts-ignore
            date: inv.content?.hero?.date || 'Date',
            owner: inv.owner,
            partnerEmail: inv.partnerEmail
        }))
    }

    if (event.method === 'POST') {
        const body = await readBody(event)

        // ACTION: ADD PARTNER
        if (body.action === 'add_partner') {
            const { slug, partnerEmail } = body
            if (!partnerEmail) throw createError({ statusCode: 400, statusMessage: 'Partner email required' })

            const [existing] = await db.select().from(invitations).where(eq(invitations.slug, slug))
            if (!existing) throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })

            if (existing.owner !== user.email) throw createError({ statusCode: 403, statusMessage: 'Only owner can invite partner' })

            await db.update(invitations).set({ partnerEmail }).where(eq(invitations.slug, slug))

            // Send Premium Email
            await sendPremiumEmail(partnerEmail, 'Undangan Kolaborasi Pernikahan', {
                title: 'Anda Diundang Berkolaborasi! 💍',
                message: `Pasangan Anda mengundang Anda untuk mengelola undangan pernikahan digital bersama-sama di platform Undangan. Silakan login untuk mulai mengedit.`,
                ctaText: 'Terima Undangan',
                ctaUrl: 'https://mengundang.site/login'
            })

            return { success: true, message: 'Partner invited' }
        }

        // ACTION: REMOVE PARTNER
        if (body.action === 'remove_partner') {
            const { slug } = body

            const [existing] = await db.select().from(invitations).where(eq(invitations.slug, slug))
            if (!existing) throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })

            if (existing.owner !== user.email) throw createError({ statusCode: 403, statusMessage: 'Only owner can remove partner' })

            await db.update(invitations).set({ partnerEmail: null }).where(eq(invitations.slug, slug))
            return { success: true }
        }

        // ACTION: CREATE
        const slug = body.slug
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid Slug' })
        }
        if (RESERVED_SLUGS.includes(slug)) {
            throw createError({ statusCode: 400, statusMessage: 'Link ini tidak boleh digunakan (Reserved)' })
        }

        // CHECK LIMITS (Only for non-admin/staff)
        if (!isAdmin && !isStaff && !isSuperuser) {
            // Get user's current limit
            const [userDetails] = await db.select().from(users).where(eq(users.email, user.email))
            const maxInv = userDetails?.maxInvitations || 1

            // Count existing invitations owned by user
            const existingUserInvs = await db.select().from(invitations).where(eq(invitations.owner, user.email))

            if (existingUserInvs.length >= maxInv) {
                throw createError({
                    statusCode: 403,
                    statusMessage: `Batas paket ${userDetails?.plan?.toUpperCase() || 'FREE'} tercapai (${maxInv}/${maxInv}). Silakan upgrade paket untuk membuat lebih banyak undangan.`
                })
            }
        }

        // CHECK EXISTING
        const [existing] = await db.select().from(invitations).where(eq(invitations.slug, slug))
        if (existing) throw createError({ statusCode: 400, statusMessage: 'Invitation already exists' })

        // DEFAULT CONTENT
        const initialData = {
            meta: { title: "Wedding Invitation", description: "" },
            hero: { groomNickname: "Groom", brideNickname: "Bride", date: "Date" },
            groom: { fullName: "", parents: "", instagram: "", image: "" },
            bride: { fullName: "", parents: "", instagram: "", image: "" },
            events: { akad: {}, resepsi: {} },
            gift: {}, music: {}, rsvp: {}
        }

        await db.insert(invitations).values({
            slug,
            owner: user.email,
            content: initialData,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return { success: true, slug }
    }

    if (event.method === 'PUT') {
        const body = await readBody(event)
        const oldSlug = body.oldSlug
        const newSlug = body.newSlug

        if (!oldSlug || !newSlug || !/^[a-z0-9-]+$/.test(newSlug)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid Slug' })
        }
        if (RESERVED_SLUGS.includes(newSlug)) {
            throw createError({ statusCode: 400, statusMessage: 'Link ini tidak boleh digunakan (Reserved)' })
        }

        const [existingOld] = await db.select().from(invitations).where(eq(invitations.slug, oldSlug))
        if (!existingOld) throw createError({ statusCode: 404, statusMessage: 'Not found' })

        if (!isManagerOrOwner(existingOld)) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

        const [existingNew] = await db.select().from(invitations).where(eq(invitations.slug, newSlug))
        if (existingNew) throw createError({ statusCode: 400, statusMessage: 'New slug exists' })

        // Drizzle doesn't support renaming PK easily if it's referenced? 
        // But here slug is PK. Simple update might fail if there are FKs? 
        // No FKs to invitations table yet.
        await db.update(invitations).set({ slug: newSlug }).where(eq(invitations.slug, oldSlug))
        return { success: true }
    }

    if (event.method === 'DELETE') {
        const body = await readBody(event)
        const slug = body.slug

        const [existing] = await db.select().from(invitations).where(eq(invitations.slug, slug))
        if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

        if (!isManagerOrOwner(existing)) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

        await db.delete(invitations).where(eq(invitations.slug, slug))
        return { success: true }
    }
})
