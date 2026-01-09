import { auth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
    try {
        return await auth.handler(toWebRequest(event));
    } catch (e: any) {
        console.error("❌ Auth Handler Crash:", e);
        throw createError({
            statusCode: 500,
            statusMessage: "Authentication Service Error",
            message: "Sedang terjadi gangguan pada layanan autentikasi. Silakan coba sesaat lagi.",
        });
    }
});
