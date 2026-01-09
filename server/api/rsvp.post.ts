import { db } from '../utils/db'
import { invitations, guests, systemSettings, users } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { sendEmail } from '../utils/email'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { slug, name, status, message, parentCommentId } = body

    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required' })

    // Validation
    if (!name || (!status && !parentCommentId)) {
        throw createError({ statusCode: 400, statusMessage: 'Name and Status are required' })
    }

    if (name.length > 50 || (message && message.length > 500)) {
        throw createError({ statusCode: 400, statusMessage: 'Input terlalu panjang' })
    }

    // Auth Check for Replies (Mempelai/Admin replying)
    let isAuthorizedReplier = false
    if (parentCommentId) {
        const user = event.context.user
        if (!user) throw createError({ statusCode: 401, statusMessage: 'Hanya admin/pemilik yang bisa membalas' })
        // Fetch invitation to check ownership
        const [inv] = await db.select().from(invitations).where(eq(invitations.slug, slug))
        if (!inv) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan' })

        const isAdmin = (user as any).role === 'admin'
        const isSuperuser = (user as any).role === 'superuser'
        const isOwner = inv.owner === user.email
        const isPartner = inv.partnerEmail === user.email

        if (!isAdmin && !isSuperuser && !isOwner && !isPartner) {
            throw createError({ statusCode: 403, statusMessage: 'Anda tidak memiliki akses untuk membalas' })
        }
        isAuthorizedReplier = true
    }

    // Fetch invitation and owner plan
    const [result] = await db.select({
        invitation: invitations,
        owner: users
    })
        .from(invitations)
        .leftJoin(users, eq(invitations.owner, users.email))
        .where(eq(invitations.slug, slug))

    if (!result || !result.invitation) throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    const { invitation, owner: ownerDetails } = result

    const content = invitation.content as any || {}
    if (!content.rsvp) content.rsvp = {}
    if (!content.rsvp.comments) content.rsvp.comments = []

    // GUEST LIMIT CHECK (Only for new guest comments, not replies from owner)
    if (!parentCommentId) {
        const currentCount = content.rsvp.comments.length
        const planId = ownerDetails?.plan || 'free'
        // Use user.maxGuests if available, otherwise fallback to plan default (though schema ensures default)
        let limit = ownerDetails?.maxGuests !== null ? ownerDetails?.maxGuests : (PLAN_CONFIGS[planId]?.maxGuests || 25)

        if (ownerDetails?.role === 'admin' || ownerDetails?.role === 'superuser') limit = 10000 // Admin bypass

        if (currentCount >= limit) {
            throw createError({
                statusCode: 403,
                statusMessage: `Maaf, batas kuota konfirmasi RSVP untuk paket ${planId.toUpperCase()} sudah penuh. Silakan hubungi pemilik undangan.`
            })
        }
    }

    const newComment = {
        id: Date.now().toString(),
        name,
        status: status || 'Mempelai', // Default for authorized replies
        message: message || '',
        createdAt: new Date().toISOString(),
        replies: []
    }

    if (parentCommentId) {
        const parentIndex = content.rsvp.comments.findIndex((c: any) => c.id === parentCommentId)
        if (parentIndex !== -1) {
            if (!content.rsvp.comments[parentIndex].replies) {
                content.rsvp.comments[parentIndex].replies = []
            }
            content.rsvp.comments[parentIndex].replies.push(newComment)
        } else {
            throw createError({ statusCode: 404, statusMessage: 'Komentar utama tidak ditemukan' })
        }
    } else {
        // New guest comment
        content.rsvp.comments.unshift(newComment)
    }

    // Save back to DB
    await db.update(invitations).set({
        content: content,
        updatedAt: new Date()
    }).where(eq(invitations.slug, slug))

    // EMAIL NOTIFICATION
    // Send only for new guest comments, not replies
    if (!parentCommentId && invitation.owner) {
        try {
            // Fetch template from settings
            const settings = await db.select().from(systemSettings)
            const settingsMap = settings.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value
                return acc
            }, {} as Record<string, string>)

            const template = settingsMap.email_rsvp_template || `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #1C1917;">Ada Tamu Baru! ✨</h2>
                    <p>Halo, seseorang baru saja mengisi RSVP di undangan <strong>{{slug}}</strong>:</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Nama:</strong> {{name}}</p>
                    <p><strong>Status:</strong> {{status}}</p>
                    <p><strong>Pesan:</strong> {{message}}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 14px; color: #666;">Cek selengkapnya di dashboard admin Anda.</p>
                </div>
            `;

            const subject = `RSVP Baru: ${name} di Undangan ${slug}`;
            const html = template
                .replace(/{{name}}/g, name)
                .replace(/{{status}}/g, status)
                .replace(/{{message}}/g, message || '-')
                .replace(/{{slug}}/g, slug);

            const recipients = [invitation.owner];
            if (invitation.partnerEmail) recipients.push(invitation.partnerEmail);

            // Using unawaited to not block the response
            sendEmail({
                to: recipients,
                subject,
                html
            }).catch((e: any) => console.error('[RSVP-Email] Background sending failed:', e));
        } catch (emailErr) {
            console.error('[RSVP-Email] Failed to prepare email:', emailErr);
        }
    }

    return { success: true, comment: newComment }
})
