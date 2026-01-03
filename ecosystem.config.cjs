// PM2 Configuration for CasaOS Local Workers
module.exports = {
    apps: [
        {
            name: 'casaos-worker',
            script: './casaos-worker.ts',
            interpreter: 'bun',
            env: {
                API_BASE_URL: 'https://premium-invitation.pages.dev',
                INTERNAL_API_SECRET: 'rahasia123',
                TELEGRAM_BOT_TOKEN: '7901463430:AAF9zVWze1Ri7AwMZnSC2bQNeaX6YlRsGWA',
                TELEGRAM_CHAT_ID: '848564111',
                WHATSAPP_TOKEN: 'EAAJRvscC9icBQU1BoFDm83nlpVifBYsrgXvo1utQnLpv3Owdjggz7gJ9SKlOjwdV8ZALmIsXEkrQ7UZA63DAYcILy8RAbj3SZB7uGffZBYbAiTRrLoMRaNIcd5Vy1tqAXZBJeVkgY8fxeos1lRYdNkC5jMLbcmQMWp8kj0QSwSrtKeMSGqsQfE6Q2IiKTL9eUsEVkP3EyFZApTQYPbcV45pHMO0JfKlkLSU4Jb',
                WHATSAPP_PHONE_ID: '1113130907380188',
                WHATSAPP_TARGET_PHONE: '6285946001116'
            }
        },
        {
            name: 'zalan-tunnel',
            script: './cloudflared',
            args: 'tunnel run --token eyJhIjoiMDYxNDkyNTQyYThhMzYwZTE0ZWUyNGFhM2YwNzU0YTEiLCJ0IjoiZWRhYWU5MGItZDFkMC00OTJiLWEyMTAtZDlmNzY2OTY3NWE4IiwicyI6Ik1qSm1OV1l4TURndE5HRm1OaTAwTmpBMExUZzFaR1F0WkRZeE5XVmxaVFk0TURCbCJ9',
            interpreter: 'none'
        }
    ]
};
// Note: The main web application is built and served by Cloudflare Pages.
// These local workers handle WhatsApp/Telegram bot logic and Cloudflare Tunneling.
