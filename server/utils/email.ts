export const sendPremiumEmail = async (to: string, subject: string, content: { title: string, message: string, ctaText?: string, ctaUrl?: string }) => {
    const config = useRuntimeConfig()
    const apiKey = config.resendApiKey // We will need to add this to nuxt.config.ts later or use env

    // Premium HTML Template "Atelier Theme"
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Georgia', serif; background-color: #f5f5f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background-color: #1c1917; padding: 30px; text-align: center; }
            .logo { color: #d6b656; font-size: 24px; font-weight: bold; letter-spacing: 1px; text-decoration: none; }
            .content { padding: 40px 30px; color: #44403c; line-height: 1.6; }
            .title { font-size: 22px; color: #1c1917; margin-bottom: 20px; font-weight: normal; }
            .btn { display: inline-block; background-color: #1c1917; color: #d6b656; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; font-family: sans-serif; font-size: 14px; }
            .footer { background-color: #fafaf9; padding: 20px; text-align: center; color: #a8a29e; font-size: 12px; font-family: sans-serif; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <a href="https://undangan.zalan.web.id" class="logo">Undangan.</a>
            </div>
            <div class="content">
                <h1 class="title">${content.title}</h1>
                <p>${content.message}</p>
                ${content.ctaText && content.ctaUrl ? `<a href="${content.ctaUrl}" class="btn">${content.ctaText}</a>` : ''}
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Undangan Premium Platform.<br>
                Dibuat dengan penuh cinta untuk momen spesial Anda.
            </div>
        </div>
    </body>
    </html>
    `

    // Log Logic (Development / No API Key)
    if (!apiKey) {
        console.log('---------------------------------------------------')
        console.log(`[📧 Mock Email] To: ${to}`)
        console.log(`[📧 Subject] ${subject}`)
        console.log(`[📧 Content] ${content.message}`)
        console.log('---------------------------------------------------')
        return { success: true, type: 'mock' }
    }

    // Real Send Logic (Resend API)
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Undangan <system@undangan.zalan.web.id>', // Needs domain verification
                to: [to],
                subject: subject,
                html: html
            })
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('[Email Error]', error)
            return { success: false, error }
        }

        return { success: true, type: 'sent' }
    } catch (e) {
        console.error('[Email Network Error]', e)
        return { success: false, error: e }
    }
}
