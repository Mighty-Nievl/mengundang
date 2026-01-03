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

            // Fetch user for phone number
            const user = await db.select().from(users).where(eq(users.id, order.userId)).get();
            const targetPhone = user?.phoneNumber || '';

            // Send WA Notification (Hybrid: Official/Local)
            if (targetPhone) {
                await sendWhatsAppNotification(`💰 *Pembayaran Diterima!*\nOrder #${order.id} Lunas Rp ${order.amount}.\nStatus: Approved.`, targetPhone, order.plan);
            }

            approvedCount++;
        }
    }

    return {
        success: true,
        approved: approvedCount,
        message: `Processed ${transactions.length} transactions. Approved ${approvedCount} orders.`
    };
});
