import { db } from './db';
import { emailNotifications } from '../db/schema';
import { nanoid } from 'nanoid';

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
}

/**
 * Sends an email using the Resend API via fetch (Cloudflare Compatible)
 */
export const sendEmail = async (options: SendEmailOptions) => {
    const config = useRuntimeConfig();
    const apiKey = config.resendApiKey;
    const from = options.from || config.emailFrom;

    if (!apiKey) {
        console.warn('⚠️ [Email] RESEND_API_KEY is not set. Email will not be sent.');
        return { success: false, error: 'API Key missing' };
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    console.log(`[Email] Sending email to ${recipients.join(', ')}: ${options.subject}`);

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: from,
                to: recipients,
                subject: options.subject,
                html: options.html,
                reply_to: options.replyTo,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[Email] Resend API Error:', data);
            // Log failure
            await db.insert(emailNotifications).values({
                id: nanoid(),
                recipient: recipients.join(', '),
                subject: options.subject,
                content: options.html,
                status: 'failed',
                error: JSON.stringify(data),
                createdAt: new Date()
            }).catch((err: Error) => console.error('[Email-Log] Failed to log failure:', err));

            return { success: false, error: data };
        }

        console.log(`✅ [Email] Sent successfully: ${data.id}`);

        // Log success
        await db.insert(emailNotifications).values({
            id: nanoid(),
            recipient: recipients.join(', '),
            subject: options.subject,
            content: options.html,
            status: 'sent',
            createdAt: new Date()
        }).catch((err: Error) => console.error('[Email-Log] Failed to log success:', err));

        return { success: true, id: data.id };
    } catch (e: any) {
        console.error('[Email] Network Error:', e);
        return { success: false, error: e.message };
    }
};
