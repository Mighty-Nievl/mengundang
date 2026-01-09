import { auth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
    try {
        return await auth.handler(toWebRequest(event));
    } catch (e: any) {
        console.error("❌ Auth Handler Crash:", e);
        throw createError({
            statusCode: 500,
            statusMessage: "Auth Handler Error",
            message: e.message,
            stack: e.stack,
            data: e
        });
    }
});
