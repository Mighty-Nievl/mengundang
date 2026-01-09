import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { hashPassword, verifyPassword } from "./password";

import * as schema from "../db/schema";

// ... imports

let _auth: any;

export const auth = new Proxy({} as any, {
    get(target, prop) {
        if (!_auth) {
            const config = useRuntimeConfig();

            // Try to get secrets from Nitro config or direct event context (Cloudflare bindings)
            const getEnv = (key: string) => {
                // 1. Try runtimeConfig (pre-mapped NUXT_* vars)
                const configKey = key.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()).replace(/^nuxt/, '');
                // Handle case where it might be e.g. googleClientId
                const camelKey = configKey.charAt(0).toLowerCase() + configKey.slice(1);
                if (config[camelKey]) return config[camelKey];

                // 2. Try process.env
                if (process.env[key]) return process.env[key];

                // 3. Try Cloudflare context bindings
                try {
                    const event = useEvent();
                    const env = event?.context?.cloudflare?.env;
                    if (env && env[key]) return env[key];
                } catch (e) { }

                return "";
            };

            const secret = getEnv('BETTER_AUTH_SECRET') || "63705fb569617799ee08a86db306af8746678e41322dd3ade5747a19d685da82";
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
                        password: {
                            hash: hashPassword,
                            verify: verifyPassword,
                        },
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

                    // Google OAuth - credentials from runtime environment
                    socialProviders: {
                        google: {
                            clientId: getEnv('NUXT_GOOGLE_CLIENT_ID'),
                            clientSecret: getEnv('NUXT_GOOGLE_CLIENT_SECRET'),
                        }
                    },
                    trustedOrigins: ['https://mengundang.site'],
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
