import { auth } from "../utils/auth";

export default defineEventHandler(async (event) => {
    try {
        console.log("[TestAuth] Attempting to get session via internal API...");
        const session = await auth.api.getSession({
            headers: event.headers
        });

        return {
            status: "ok",
            session: session || "no session",
            config: {
                baseUrl: "verified",
                hasSecret: !!process.env.BETTER_AUTH_SECRET
            }
        };
    } catch (e: any) {
        console.error("[TestAuth] Failed:", e);
        return {
            status: "error",
            message: e.message,
            stack: e.stack
        };
    }
});
