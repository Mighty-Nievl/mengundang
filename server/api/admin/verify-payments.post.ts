import { defineEventHandler } from 'h3';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { db } from '../../utils/db';
import { orders, users } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { applyPlanToUser } from '../../utils/plan';
import { processReferralBonus } from '../../utils/referral';


const execAsync = promisify(exec);

export default defineEventHandler(async (event) => {
    // 1. Security Check
    // @ts-ignore
    const user = event.context.user
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    try {
        // 2. Run the Scraper Script
        const scriptPath = path.resolve(process.cwd(), 'gofood-scraper.cjs');
        console.log(`[VerifyPayment] Running scraper: ${scriptPath}`);

        const { stdout, stderr } = await execAsync(`node ${scriptPath}`, {
            cwd: process.cwd(),
            timeout: 120000 // 2 minutes timeout
        });

        // 3. Parse JSON Output
        const jsonMatch = stdout.match(/---JSON_START---([\s\S]*?)---JSON_END---/);
        if (!jsonMatch) {
            throw new Error("Scraper did not return valid JSON block.");
        }

        const transactions = JSON.parse(jsonMatch[1]);
        console.log(`[VerifyPayment] Found ${transactions.length} transactions.`);

        // 4. Match with Database Orders
        // Fetch all pending orders
        const pendingOrders = await db.select().from(orders).where(eq(orders.status, 'pending'));
        console.log(`[VerifyPayment] Found ${pendingOrders.length} pending orders.`);

        const approvedOrders = [];
        const logs = [];

        for (const order of pendingOrders) {
            // Find a matching transaction
            const matchedTx = transactions.find((tx: any) => {
                // Parse amount string
                let txAmount = 0;
                if (tx.amount && tx.amount !== "0") {
                    txAmount = parseInt(tx.amount.replace(/[^0-9]/g, ''), 10);
                }

                const isSuccess = tx.status && (tx.status.toLowerCase().includes('berhasil') || tx.status.toLowerCase().includes('settlement'));

                // Log details for debugging
                console.log(`[VerifyPayment] Checking Tx Ref: ${tx.ref_id}, Amount: ${txAmount} vs Order: ${order.amount}`);

                // Match Logic: Amount Match + Success Status
                return isSuccess && txAmount === order.amount;
            });

            if (matchedTx) {
                console.log(`[VerifyPayment] MATCH FOUND! Order ${order.id} matches transaction of ${matchedTx.amount} (Ref: ${matchedTx.ref_id})`);

                // Perform Approval Logic (Same as approve.post.ts)

                // 1. Update Order Status
                await db.update(orders)
                    .set({ status: 'approved', updatedAt: new Date() })
                    .where(eq(orders.id, order.id));

                // 2. Update User Plan & Limits using centralized utility
                await applyPlanToUser(order.userId, order.plan)

                // 3. Process Referral Bonus
                await processReferralBonus(order.userId, order.plan);

                approvedOrders.push({
                    orderId: order.id,
                    amount: order.amount,
                    plan: order.plan,
                    user: order.userId
                });

                logs.push(`Auto-approved Order #${order.id} for Rp ${order.amount}`);

                // Optional: Mark transaction as 'used' in verification to prevent double-spending?
                // For MVP, simplistic check only.
            }
        }

        return {
            success: true,
            message: `Scraper executed. Approved ${approvedOrders.length} orders.`,
            data: {
                transactions,
                approvedOrders
            },
            logs: logs
        };

    } catch (error) {
        console.error("[VerifyPayment] Error:", error);
        return {
            success: false,
            message: "Failed to verify payments.",
            error: error.message,
            details: error.stderr || ''
        };
    }
});
