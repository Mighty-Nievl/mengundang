import { db } from '../../../utils/db'
import { users, accounts } from '../../../db/schema'
import { desc, gt, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. Verify Admin
    // @ts-ignore
    const user = event.context.user
    if (!user || user.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    // 2. Fetch users with balance > 0
    const results = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        referralBalance: users.referralBalance,
        referralCode: users.referralCode,
        // We'll try to fetch bank info if we store it, otherwise just basic info
        // Currently we store bank info in 'content' inside invitations, 
        // but here we just list the user. The admin will likely check WA for bank details.
    })
        .from(users)
        .where(gt(users.referralBalance, 0))
        .all()

    return results
})
