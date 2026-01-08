import { Database } from 'bun:sqlite';
import { scryptSync, randomBytes } from 'node:crypto';

const db = new Database('sqlite.db');
const email = 'testadmin@zalan.web.id';
const password = 'password123';

// 1. Get User
const user = db.query("SELECT * FROM user WHERE email = $email").get({ $email: email }) as any;

if (!user) {
    console.error("User not found! Please run seed first or check email.");
    process.exit(1);
}

console.log(`Found user: ${user.id}`);

// 2. Hash Password (compatible with Better Auth default scrypt)
// Better Auth uses: scrypt(password, salt, 64)
// We need to mimic that or just use a simple bcrypt if configured?
// Wait, Better Auth defaults to scrypt or argon2 depending on setup.
// Let's look at server/utils/auth.ts -> It doesn't specify hashing explicitly, so it uses default.
// Default in Better Auth v1 is usually Scrypt or bcrypt. 
// BUT, implementing the exact hashing in a raw script is risky if we don't match the config.
//
// STRATEGY CHANGE: 
// Instead of crypto magic, we should use the Better Auth API code I wrote in `init-local-admin` 
// but since that endpoint relies on the server running, maybe checking why that endpoint failed or wasn't run is better?
// 
// However, the user might have failed to run it.
//
// ALTERNATIVE: Use the `better-auth` library directly in this script to hash.

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// We need schema but importing it might be complex with Bun if it uses specialized imports.
// Let's try a simpler approach: 
// We will use the `debug/init-local-admin` approach but trigger it via fetch since the server is running.

(async () => {
    console.log("Triggering init-local-admin via API...");
    try {
        const response = await fetch('http://localhost:3000/api/debug/init-local-admin');
        const data = await response.json();
        console.log("Response:", data);
    } catch (err) {
        console.error("Failed to fetch:", err);
    }
})();
