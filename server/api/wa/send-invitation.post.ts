import { db } from '../../utils/db'
import { waNotifications } from '../../db/schema'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
    // Auth check
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { phone, guestName, invitationSlug } = body

    if (!phone || !guestName || !invitationSlug) {
        throw createError({ statusCode: 400, statusMessage: 'Missing required fields: phone, guestName, invitationSlug' })
    }

    // Format phone number: 08xxx -> 628xxx
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1)
    }

    // Build invitation link
    const baseUrl = process.env.BETTER_AUTH_URL || 'https://undangan.zalan.web.id'
    const link = `${baseUrl}/${invitationSlug}?to=${encodeURIComponent(guestName)}`

    // Build message
    const message = `Halo ${guestName}! ✨

Tanpa mengurangi rasa hormat, perkenankan kami mengundang bapak/ibu/saudara/i untuk hadir di acara pernikahan kami.

Detail undangan dapat dilihat pada link di bawah ini:
${link}

Merupakan suatu kebahagiaan bagi kami apabila bapak/ibu/saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih. 🙏`

    try {
        // Queue to waNotifications table
        await db.insert(waNotifications).values({
            id: nanoid(),
            phoneNumber: formattedPhone,
            message: message,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        })

        console.log(`[SendInvitation] Queued invitation for ${guestName} to ${formattedPhone}`)

        return {
            success: true,
            message: 'Pesan antri dikirim via WhatsApp Bot',
            phone: formattedPhone
        }
    } catch (e: any) {
        console.error('[SendInvitation] Failed to queue:', e)
        throw createError({ statusCode: 500, statusMessage: 'Gagal mengirim pesan' })
    }
})
