import { db } from './server/utils/db';
import { orders, users } from './server/db/schema';


// Run with: bun run seed-test-order.ts

const run = async () => {
    console.log("Seeding dummy order...");

    // Ensure a user exists (using a known ID or creating one)
    // For simplicity, let's create a test user or use existing one if we knew it.
    // We'll create a temp user to be safe.
    const userId = crypto.randomUUID();
    await db.insert(users).values({
        id: userId,
        name: "Test User",
        email: `test-${userId}@example.com`,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "user",
        plan: "free"
    });
    console.log("Created user:", userId);

    const orderId = crypto.randomUUID();
    await db.insert(orders).values({
        id: orderId,
        userId: userId,
        plan: "vip",
        amount: 50000, // Matches the mocked "Rp 50.000"
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
    });
    console.log("Created PENDING order:", orderId, "Amount: 50000");
};

run().then(() => {
    console.log("Done.");
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
