import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

import * as schema from "../db/schema";

// ... imports

let _auth: any;

export const auth = new Proxy({} as any, {
    get(target, prop) {
        if (!_auth) {
            // Sanitize all potentially corrupted env vars from Cloudflare
            for (const key of ['BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'NUXT_GOOGLE_CLIENT_ID', 'NUXT_GOOGLE_CLIENT_SECRET']) {
                if (process.env[key]?.startsWith(key + '=')) {
                    process.env[key] = process.env[key]!.replace(key + '=', '');
                }
            }

            const secret = process.env.BETTER_AUTH_SECRET || "63705fb569617799ee08a86db306af8746678e41322dd3ade5747a19d685da82";
            const isDev = process.env.NODE_ENV === "development";
            const baseUrl = "https://mengundang.site";

            try {
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
            } catch (initErr: any) {
                console.error("❌ Better Auth Init Failed:", initErr);
                throw initErr;
            }
            console.log("✅ Better Auth Initialized via Proxy");
        }
        return Reflect.get(_auth, prop);
    }
});
