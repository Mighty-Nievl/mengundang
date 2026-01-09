import { db } from '../../../utils/db'
import { users, referralTransactions } from '../../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { sendTelegramMessage } from '../../../utils/telegram'

export default defineEventHandler(async (event) => {
    // 1. Verify Admin
    // @ts-ignore
    const user = event.context.user
    const allowedRoles = ['admin', 'superuser']
    if (!user || !allowedRoles.includes(user.role)) {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { userId, amount } = body

    if (!userId || !amount || amount <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid Data' })
    }

    // 2. Initial Check
    const targetUser = await db.select().from(users).where(eq(users.id, userId)).get()
    if (!targetUser) throw createError({ statusCode: 404, statusMessage: 'User Not Found' })

    if ((targetUser.referralBalance || 0) < amount) {
        throw createError({ statusCode: 400, statusMessage: 'Saldo user tidak cukup' })
    }

    // 3. Process Transaction
    try {
        await db.transaction(async (tx) => {
            // Deduct Balance
            await tx.update(users)
                .set({
                    referralBalance: sql`${users.referralBalance} - ${amount}`,
                    updatedAt: new Date()
                })
                .where(eq(users.id, userId))
                .run()

            // Record Transaction
            await tx.insert(referralTransactions).values({
                id: uuidv4(),
                referrerId: userId,
                refereeId: user.id, // Admin as executor
                amount: amount,
                type: 'withdrawal',
                createdAt: new Date()
            }).run()
        })

        // 4. Notify (Async)
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
        sendTelegramMessage(`💸 *Payout Successful*\n\nUser: ${targetUser.name} (${targetUser.email})\nAmount: ${formattedAmount}\nAdmin: ${user.name}`)

        return { success: true }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: 'Database Error: ' + e.message })
    }
})
