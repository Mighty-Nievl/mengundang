import { auth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
    try {
        return await auth.handler(toWebRequest(event));
    } catch (e: any) {
        console.error("❌ Auth Handler Crash:", e);
        return {
            status: "error",
            message: "Authentication Service Crashed",
            details: e.message,
            stack: e.stack
        }
    }
});
