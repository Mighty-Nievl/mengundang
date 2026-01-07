
import { db } from '../utils/db'
import { users, accounts } from '../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    try {
        console.log('[Reset-Pass] Starting...')

        // 1. Get Hash from Temp Admin
        const tempUserList = await db.select().from(users).where(eq(users.email, 'temp-admin@test.com')).limit(1)
        const tempUser = tempUserList[0]

        if (!tempUser) return { status: 'error', message: 'Temp user not found' }
        console.log('[Reset-Pass] Temp User ID:', tempUser.id)

        const tempAccountList = await db.select().from(accounts).where(eq(accounts.userId, tempUser.id)).limit(1)
        const tempAccount = tempAccountList[0]

        if (!tempAccount || !tempAccount.password) return { status: 'error', message: 'Temp account/password not found' }

        const validHash = tempAccount.password
        console.log('[Reset-Pass] Hash retrieved successfully')

        // 2. Insert Hash for Target Admin
        const targetUserList = await db.select().from(users).where(eq(users.email, 'rezalhbramantara@gmail.com')).limit(1)
        const targetUser = targetUserList[0]

        if (!targetUser) return { status: 'error', message: 'Target user not found' }
        console.log('[Reset-Pass] Target User ID:', targetUser.id)

        // Check if account already exists
        const existingAccountList = await db.select().from(accounts).where(eq(accounts.userId, targetUser.id)).limit(1)
        const existingAccount = existingAccountList[0]

        if (existingAccount) {
            console.log('[Reset-Pass] Account exists. Updating...')
            await db.update(accounts).set({ password: validHash }).where(eq(accounts.id, existingAccount.id))
            return { status: 'success', message: 'Password updated', accountId: existingAccount.id }
        } else {
            console.log('[Reset-Pass] Account missing. Inserting...')
            const newId = crypto.randomUUID()

            await db.insert(accounts).values({
                id: newId,
                userId: targetUser.id,
                accountId: newId,
                providerId: 'credential',
                password: validHash,
                createdAt: new Date(),
                updatedAt: new Date()
            })

            return { status: 'success', message: 'Account created with password', accountId: newId }
        }
    } catch (e: any) {
        console.error('[Reset-Pass] Error:', e)
        return { status: 'error', message: e.message, stack: e.stack }
    }
})
