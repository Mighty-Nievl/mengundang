import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

import * as schema from "../db/schema";

// ... imports

let _auth: any;

export const auth = new Proxy({} as any, {
    get(target, prop) {
        if (!_auth) {
            const config = useRuntimeConfig();

            // Resolve variables lazily to ensure plugins have run
            const secret = config.betterAuthSecret || process.env.NUXT_BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET;
            const baseUrl = config.betterAuthUrl || process.env.NUXT_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'https://kamiundang.site';

            console.log(`[Auth] Initializing. Secret Length: ${secret ? secret.length : 0}, URL: ${baseUrl}`);

            _auth = betterAuth({
                secret: secret,
                baseURL: baseUrl,
                database: drizzleAdapter(db, {
                    provider: "sqlite",
                    schema: {
                        user: schema.users,
                        session: schema.sessions,
                        account: schema.accounts,
                        verification: schema.verifications
                    }
                }),
                emailAndPassword: {
                    enabled: true,
                    minPasswordLength: 8,
                    maxPasswordLength: 32,
                },
                user: {
                    additionalFields: {
                        role: { type: "string", defaultValue: "user" },
                        plan: { type: "string", defaultValue: "free" },
                        maxInvitations: { type: "number", defaultValue: 1 },
                        referralCode: { type: "string", required: false },
                        referredBy: { type: "string", required: false },
                        referralBalance: { type: "number", defaultValue: 0 },
                        registrationIp: { type: "string", required: false },
                        phoneNumber: { type: "string", required: false },
                        bankName: { type: "string", required: false },
                        bankAccountNumber: { type: "string", required: false },
                        bankAccountName: { type: "string", required: false }
                    }
                },

                socialProviders: {
                    google: {
                        clientId: process.env.NUXT_GOOGLE_CLIENT_ID || "",
                        clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET || "",
                    }
                },
                trustedOrigins: [baseUrl, 'https://kamiundang.site'],
                accountLinking: {
                    enabled: true
                }
            });
            console.log("✅ Better Auth Initialized via Proxy");
        }
        return Reflect.get(_auth, prop);
    }
});
