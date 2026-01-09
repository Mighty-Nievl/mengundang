import { sendTelegramMessage } from '../../../utils/telegram'

export default defineEventHandler(async (event) => {
    // 1. Verify Admin
    // @ts-ignore
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']
    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    try {
        await sendTelegramMessage('🤖 *Test Signal*\n\nAdmin Panel connection is active!')
        return { success: true }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: 'Telegram Error: ' + e.message })
    }
})
