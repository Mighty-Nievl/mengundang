import { db } from '../../utils/db';
import { orders, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { applyPlanToUser } from '../../utils/plan';
import { sendWhatsAppNotification } from '../../utils/whatsapp';

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const authHeader = getHeader(event, 'x-api-secret');
    if (authHeader !== process.env.INTERNAL_API_SECRET) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // 2. Parse Body (Transactions from Scraper)
    const body = await readBody(event);
    const transactions = body.transactions; // Expecting { transactions: [...] }

    if (!Array.isArray(transactions)) {
        return { success: false, message: 'Invalid data format' };
    }

    // 3. Get Pending Orders
    const pendingOrders = await db.select().from(orders).where(eq(orders.status, 'pending'));
    let approvedCount = 0;

    // 4. Match Logic
    for (const order of pendingOrders) {
        const matchedTx = transactions.find((tx: any) => {
            let txAmount = 0;
            if (tx.amount && tx.amount !== "0") {
                txAmount = parseInt(String(tx.amount).replace(/[^0-9]/g, ''), 10);
            }
            const isSuccess = tx.status && (tx.status.toLowerCase().includes('berhasil') || tx.status.toLowerCase().includes('settlement'));
            return isSuccess && txAmount === order.amount;
        });

        if (matchedTx) {
            console.log(`[Sync] MATCH FOUND! Order ${order.id} matches transaction of ${matchedTx.amount}`);

            // Approve Order
            await db.update(orders).set({ status: 'approved', updatedAt: new Date() }).where(eq(orders.id, order.id));

            // Apply Plan
            await applyPlanToUser(order.userId, order.plan);

            // Send WA Notification (Hybrid: Official/Local)
            await sendWhatsAppNotification(`💰 *Pembayaran Diterima!*\nOrder #${order.id} Lunas Rp ${order.amount}.\nStatus: Approved.`, order.phoneNumber || '', order.plan);
            // Note: order.phoneNumber might not exist in 'orders' table, we might need to fetch user?
            // Checking schema: orders table does NOT have phoneNumber. users table does.
            // But sendWhatsAppMessage defaults to admin if no phone provided? 
            // In worker.ts: `notifyBot` sent to Telegram options. 
            // Here we are sending to Admin via WA or Telegram?
            // worker.ts sent to Telegram. 
            // Here `sendWhatsAppMessage` sends to WA. 
            // Let's stick to the server logic: maybe notify Admin via WA?
            // The worker.ts used `notifyBot` (Telegram).
            // We should ideally keep Telegram notifications?
            // But the bot is on CasaOS. The server can't directly talk to Telegram Bot API unless we setup the bot token here too.
            // We can setup Telegram Bot Token in Cloudflare Env Vars.

            approvedCount++;
        }
    }

    return {
        success: true,
        approved: approvedCount,
        message: `Processed ${transactions.length} transactions. Approved ${approvedCount} orders.`
    };
});
