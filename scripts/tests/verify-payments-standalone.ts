import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { db } from '../../server/utils/db';
import { orders, users, referralTransactions } from '../../server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { applyPlanToUser } from './server/utils/plan';
import { nanoid } from 'nanoid';
import { sendWhatsAppMessage } from './server/utils/whatsapp-cloud';

// Run with: bun run verify-payments-standalone.ts

const execAsync = promisify(exec);

const run = async () => {
    console.log("[VerifyPayment] Starting...");
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
            console.error("Scraper Output:", stdout);
            throw new Error("Scraper did not return valid JSON block.");
        }

        const transactions = JSON.parse(jsonMatch[1]);
        console.log(`[VerifyPayment] Found ${transactions.length} transactions.`);

        // 4. Match with Database Orders
        // Fetch all pending orders
        const pendingOrders = await db.select().from(orders).where(eq(orders.status, 'pending'));
        console.log(`[VerifyPayment] Found ${pendingOrders.length} pending orders.`);

        let approvedCount = 0;

        for (const order of pendingOrders) {
            // Find a matching transaction
            // Heuristic: Match exact Amount && Status == 'Berhasil'
            // In a real system, we might check date windows or unique codes if available.

            const matchedTx = transactions.find((tx: any) => {
                // Parse amount string
                let txAmount = 0;
                if (tx.amount && tx.amount !== "0") {
                    txAmount = parseInt(tx.amount.replace(/[^0-9]/g, ''), 10);
                }

                const isSuccess = tx.status && (tx.status.toLowerCase().includes('berhasil') || tx.status.toLowerCase().includes('settlement'));

                // Log details for debugging
                if (tx.ref_id) console.log(`[VerifyPayment] Transaction Ref ID: ${tx.ref_id}, Amount: ${txAmount}`);

                // Match Logic:
                return isSuccess && txAmount === order.amount;
            });

            if (matchedTx) {
                console.log(`[VerifyPayment] MATCH FOUND! Order ${order.id} matches transaction of ${matchedTx.amount} (Ref: ${matchedTx.ref_id})`);

                // Perform Approval Logic

                // 1. Update Order Status
                await db.update(orders)
                    .set({ status: 'approved', updatedAt: new Date() })
                    .where(eq(orders.id, order.id));

                // 2. Update User Plan & Limits using centralized utility
                await applyPlanToUser(order.userId, order.plan)

                // 3. Handle Referral Bonus
                if (order.referrerId) {
                    try {
                        let bonusAmount = 0;
                        if (order.plan === 'regular') bonusAmount = 5000;
                        else if (order.plan === 'vip') bonusAmount = 10000;
                        else if (order.plan === 'vvip') bonusAmount = 15000;

                        if (bonusAmount > 0) {
                            const [referrer] = await db.select().from(users).where(eq(users.id, order.referrerId)).limit(1);
                            const [referee] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);

                            if (referrer) {
                                // Update Referrer Balance
                                await db.update(users)
                                    .set({
                                        referralBalance: sql`${users.referralBalance} + ${bonusAmount}`,
                                        updatedAt: new Date()
                                    })
                                    .where(eq(users.id, referrer.id));

                                // Create Transaction Record
                                await db.insert(referralTransactions).values({
                                    id: nanoid(),
                                    referrerId: referrer.id,
                                    refereeId: order.userId,
                                    amount: bonusAmount,
                                    type: 'bonus',
                                    createdAt: new Date()
                                });

                                // Send WhatsApp Notification to Referrer
                                if (referrer.phoneNumber) {
                                    const formattedBonus = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(bonusAmount);

                                    // Fraud Check: Matching IP Address
                                    let fraudWarning = "";
                                    if (order.ipAddress && referrer.ipAddress && order.ipAddress === referrer.ipAddress) {
                                        fraudWarning = "\n\n⚠️ *WARNING:* IP Address sama dengan pengundang. Potensi self-referral!";
                                        console.warn(`[VerifyPayment] Potential self-referral for order ${order.id}. IP: ${order.ipAddress}`);
                                    }

                                    const msg = `💰 *Bonus Referral Masuk!* 💰\n\nSelamat ${referrer.name}, Anda baru saja mendapatkan bonus *${formattedBonus}* karena teman Anda (${referee?.name || 'Teman'}) telah melakukan upgrade ke paket ${order.plan.toUpperCase()}.\n\nCek saldo Anda di: https://undangan.zalan.web.id/referral\n\nTerima kasih telah merekomendasikan Zalan Invitation! ✨${fraudWarning}`;
                                    await sendWhatsAppMessage(msg, referrer.phoneNumber);
                                }
                            }
                        }
                    } catch (refErr) {
                        console.error("[VerifyPayment] Referral process error:", refErr);
                    }
                }

                console.log(`[VerifyPayment] Auto-approved Order #${order.id}`);
                approvedCount++;
            }
        }

        console.log(`[VerifyPayment] Finished. Approved ${approvedCount} orders.`);
        process.exit(0);

    } catch (error) {
        console.error("[VerifyPayment] Error:", error);
        process.exit(1);
    }
};

run();
