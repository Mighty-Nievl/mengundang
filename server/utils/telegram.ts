export const sendTelegramMessage = async (text: string, options: any = {}) => {
    const config = useRuntimeConfig()
    const token = config.telegramBotToken
    // Allow overriding chatId (useful for replying to different users if needed later)
    const chatId = options.chat_id || config.telegramChatId

    if (!token || !chatId) {
        console.warn('Telegram config missing. Message not sent:', text)
        return
    }

    try {
        await $fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            body: {
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown',
                ...options
            }
        })
    } catch (e: any) {
        console.error('Failed to send Telegram message:', e.message)
    }
}
