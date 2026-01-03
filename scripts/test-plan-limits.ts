
import { db } from '../server/utils/db';
import { users, invitations } from '../server/db/schema';
import { eq } from 'drizzle-orm';
import { applyPlanToUser } from '../server/utils/plan';

// Run with: bun run scripts/test-plan-limits.ts

async function run() {
    console.log("Starting Plan Limits Test...");

    const testEmail = 'test_limit_user@example.com';

    // Cleanup previous test
    await db.delete(invitations).where(eq(invitations.owner, testEmail));
    await db.delete(users).where(eq(users.email, testEmail));

    // 1. Create User
    console.log("1. Creating Test User...");
    await db.insert(users).values({
        id: 'test-limit-user-id',
        email: testEmail,
        name: 'Test Limit User',
        emailVerified: true,
        role: 'user',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
        maxInvitations: 1, // Default
        maxGuests: 25 // Default
    });

    // 2. Apply 'Regular' Plan
    console.log("2. Applying Regular Plan...");
    await applyPlanToUser('test-limit-user-id', 'regular');

    const [user] = await db.select().from(users).where(eq(users.email, testEmail));
    if (user.maxInvitations !== 5 || user.maxGuests !== 50) {
        console.error("FAIL: Regular plan limits not applied correctly.", user);
    } else {
        console.log("PASS: Regular plan limits applied (Inv: 5, Guests: 50)");
    }

    // 3. Test Manual Override
    console.log("3. Testing Manual Override...");
    await db.update(users).set({ maxGuests: 100 }).where(eq(users.email, testEmail));
    const [userOverride] = await db.select().from(users).where(eq(users.email, testEmail));
    if (userOverride.maxGuests !== 100) {
        console.error("FAIL: Manual override failed.");
    } else {
        console.log("PASS: Manual override successful (Guests: 100)");
    }

    // Cleanup
    await db.delete(invitations).where(eq(invitations.owner, testEmail));
    await db.delete(users).where(eq(users.email, testEmail));

    console.log("Test Complete.");
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
