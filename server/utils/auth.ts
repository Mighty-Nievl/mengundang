import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

import * as schema from "../db/schema";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.BETTER_AUTH_URL || ""],
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
        minLength: 8,
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
    advanced: {
        cookie: {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            domain: process.env.BETTER_AUTH_URL ? new URL(process.env.BETTER_AUTH_URL).hostname : undefined
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.NUXT_GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET || "",
        }
    },
    accountLinking: {
        enabled: true
    }
});
