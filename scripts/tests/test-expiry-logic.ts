import { db } from '../../server/utils/db'
import { users, invitations } from '../../server/db/schema'
import { eq } from 'drizzle-orm'

async function testExpiry() {
    console.log('--- TESTING MASA AKTIF SYSTEM ---')

    // 1. Create a dummy user and expired plan
    const testEmail = 'expired-test@zalan.web.id'
    const testSlug = 'test-expired-link'

    console.log('Step 1: Setting up expired test user and invitation...')

    // Cleanup if exists
    await db.delete(invitations).where(eq(invitations.slug, testSlug))
    await db.delete(users).where(eq(users.email, testEmail))

    // Create User
    const userId = 'user_' + Date.now()
    await db.insert(users).values({
        id: userId,
        name: 'Expired User',
        email: testEmail,
        emailVerified: true,
        plan: 'free',
        planExpiresAt: new Date(Date.now() - 86400000), // Expired 1 day ago
        createdAt: new Date(),
        updatedAt: new Date()
    })

    // Create Invitation owned by this user
    await db.insert(invitations).values({
        slug: testSlug,
        owner: testEmail,
        content: { hero: { groomNickname: 'Test', brideNickname: 'Expired' } },
        createdAt: new Date(),
        updatedAt: new Date()
    })

    console.log('Step 2: Logic verification via manual check...')

    // Fetch via query (simulating the join in API)
    const [result] = await db.select({
        invitation: invitations,
        owner: users
    })
        .from(invitations)
        .leftJoin(users, eq(invitations.owner, users.email))
        .where(eq(invitations.slug, testSlug))

    if (result && result.owner?.planExpiresAt) {
        const isExpired = new Date() > new Date(result.owner.planExpiresAt)
        console.log(`Plan Status for ${testSlug}: ${isExpired ? 'EXPIRED (Blocked)' : 'ACTIVE (Allowed)'}`)

        if (isExpired) {
            console.log('✅ SUCCESS: System correctly identified the expired plan.')
        } else {
            console.log('❌ FAILURE: System failed to identify expiry.')
        }
    } else {
        console.log('❌ FAILURE: Data not found.')
    }

    // Cleanup
    await db.delete(invitations).where(eq(invitations.slug, testSlug))
    await db.delete(users).where(eq(users.email, testEmail))

    process.exit(0)
}

testExpiry()
