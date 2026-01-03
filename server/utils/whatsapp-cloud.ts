// Standalone WhatsApp Cloud API Helper

// Load config from environment variables
const CFG = {
    TOKEN: process.env.WHATSAPP_TOKEN || '',
    PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',
    TARGET_PHONE: process.env.WHATSAPP_TARGET_PHONE || '6285792441446'
};

export const sendWhatsAppMessage = async (message: string, toPhone?: string) => {
    const target = toPhone || CFG.TARGET_PHONE;

    if (!CFG.TOKEN || !CFG.PHONE_ID) {
        console.warn("[WhatsAppCloud] Missing credentials in .env (WHATSAPP_TOKEN or WHATSAPP_PHONE_ID)");
        return false;
    }

    try {
        const url = `https://graph.facebook.com/v21.0/${CFG.PHONE_ID}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            to: target,
            type: "text",
            text: { body: message }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CFG.TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[WhatsAppCloud] API Error:", JSON.stringify(data));
            return false;
        }

        console.log(`[WhatsAppCloud] Message sent to ${target}`);
        return true;

    } catch (error) {
        console.error("[WhatsAppCloud] Network Error:", error);
        return false;
    }
};
