import { loadEnv } from 'vite'
import fs from 'fs'

// Load .env manual logic because useRuntimeConfig is for Nuxt
const envContent = fs.readFileSync('.env', 'utf-8')
const env: Record<string, string> = {}

envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=')
    if (key && val) env[key.trim()] = val.join('=').trim()
})

const token = env.TELEGRAM_BOT_TOKEN
const chatId = env.TELEGRAM_CHAT_ID
const baseUrl = env.BETTER_AUTH_URL || 'https://undangan.zalan.web.id' // Fallback to current prod

if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in .env')
    process.exit(1)
}

const WEBHOOK_URL = `${baseUrl}/api/telegram/webhook`

console.log(`🤖 Setting up Webhook for Bot...`)
console.log(`📡 URL: ${WEBHOOK_URL}`)

async function setWebhook() {
    try {
        // 1. Set Webhook
        const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${WEBHOOK_URL}`)
        const data = await res.json()

        if (data.ok) {
            console.log('✅ Webhook Successfully Set!')
        } else {
            console.error('❌ Failed to set webhook:', data)
        }

        // 2. Send Test Message (if Chat ID is present)
        if (chatId) {
            console.log('📨 Sending test message...')
            const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: '🚀 *Premium Invitation Bot is Online!*\n\nSystem is ready to notify you.',
                    parse_mode: 'Markdown'
                })
            })
            const msgData = await msgRes.json()
            if (msgData.ok) {
                console.log('✅ Test message sent!')
            } else {
                console.warn('⚠️ Failed to send test message:', msgData)
            }
        } else {
            console.warn('⚠️ TELEGRAM_CHAT_ID not found in .env. Skipping test message.')
        }

    } catch (e) {
        console.error('❌ Network Error:', e)
    }
}

setWebhook()
