import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

import * as schema from "../db/schema";

// ... imports

let _auth: any;

export const auth = new Proxy({} as any, {
    get(target, prop) {
        if (!_auth) {
            // BRUTAL HARDCODING FOR PRODUCTION
            const secret = process.env.BETTER_AUTH_SECRET || "63705fb569617799ee08a86db306af8746678e41322dd3ade5747a19d685da82"; // Fallback just in case
            const isDev = process.env.NODE_ENV === "development";
            const baseUrl = isDev ? "http://localhost:3000" : "https://mengundang.site";

            console.log(`[Auth] Initializing. URL: ${baseUrl}`);

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
                trustedOrigins: isDev ? ['http://localhost:3000', 'https://mengundang.site'] : ['https://mengundang.site'],
                advanced: {
                    defaultCookieAttributes: {
                        secure: !isDev,
                        sameSite: "lax",
                        httpOnly: true
                    }
                },
                accountLinking: {
                    enabled: true
                }
            });
            console.log("✅ Better Auth Initialized via Proxy");
        }
        return Reflect.get(_auth, prop);
    }
});
