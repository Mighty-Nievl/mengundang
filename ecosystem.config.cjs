// PM2 Configuration for CasaOS Local Workers
module.exports = {
    apps: [
        {
            name: 'casaos-worker',
            script: './casaos-worker.ts',
            interpreter: 'bun',
            env: {
                API_BASE_URL: 'https://premium-invitation-v2.pages.dev',
                INTERNAL_API_SECRET: 'rahasia123',
                TELEGRAM_BOT_TOKEN: '7901463430:AAF9zVWze1Ri7AwMZnSC2bQNeaX6YlRsGWA',
                TELEGRAM_CHAT_ID: '848564111',
                // WhatsApp Official API (Meta Cloud) - Token expires in 24h
                WHATSAPP_TOKEN: 'EAAJRvscC9icBQYljM5V2U2IRfhxZBKnQU6HKW07KBoRqfqOXWixfMg91IUmfYqS5vtqz8pNwuU2ZBZBQii0cMxzmaZACVtRtpN7FZC1HQVHyfZCYiFql1gjihv310MkG1fm01huUNsDSXi5felZAgxnlNXjaradEZC8Nugmm2MmchbecqZCvQvWvUJxTZAg92yfwbsdbtV8qHe6i7XiZAl96DqAZCou7sOA7pSyl8B1wnUmBxzC17Q3pP1h5a9d4Twwg8NwZD',
                WHATSAPP_PHONE_ID: '960153967174954',
                WHATSAPP_TARGET_PHONE: '6282265030113'
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
