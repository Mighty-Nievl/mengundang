import { auth } from "../../utils/auth";
import { db } from "../../utils/db";
import { users, accounts, sessions } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    if (process.env.NODE_ENV !== "development") {
        throw createError({ statusCode: 403, statusMessage: "Forbidden in Production" });
    }

    const email = "testadmin@zalan.web.id";
    const password = "password123";
    const name = "Test Admin";

    try {
        console.log("Recreating admin account...");

        // 1. DELETE EXISTING USER & ACCOUNTS to ensure clean slate
        // Drizzle delete
        const existingUser = await db.select().from(users).where(eq(users.email, email)).get();

        if (existingUser) {
            console.log("Deleting existing user:", existingUser.id);
            await db.delete(accounts).where(eq(accounts.userId, existingUser.id));
            await db.delete(sessions).where(eq(sessions.userId, existingUser.id));
            await db.delete(users).where(eq(users.id, existingUser.id));
        }

        // 2. Sign up fresh
        const res = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                // Assuming we can pass custom fields like role if configured in schema?
                // If not, we might need to update the role manually after creation.
            },
            asResponse: false
        });

        // 3. Force update role to admin just in case
        if (res && res.user) {
            await db.update(users)
                .set({ role: 'admin', plan: 'vvip' })
                .where(eq(users.id, res.user.id));
        }

        return {
            status: "success",
            message: "Admin account RE-CREATED",
            credentials: { email, password },
            data: res
        };

    } catch (e: any) {
        console.error("Sign up failed:", e);
        return {
            status: "error",
            message: "Failed to init admin",
            error: e.message
        };
    }
});
