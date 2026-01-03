export default defineNitroPlugin((nitroApp) => {
    const config = useRuntimeConfig();

    // Polyfill process.env for global utilities like Better Auth
    if (typeof globalThis.process === 'undefined') {
        // @ts-ignore
        globalThis.process = { env: {} };
    } else if (typeof globalThis.process.env === 'undefined') {
        globalThis.process.env = {};
    }

    // Map Nitro runtime config to process.env
    // @ts-ignore
    globalThis.process.env.BETTER_AUTH_SECRET = config.betterAuthSecret || process.env.NUXT_BETTER_AUTH_SECRET;
    // @ts-ignore
    globalThis.process.env.BETTER_AUTH_URL = config.betterAuthUrl || process.env.NUXT_BETTER_AUTH_URL;
    // @ts-ignore
    globalThis.process.env.INTERNAL_API_SECRET = config.internalApiSecret || process.env.NUXT_INTERNAL_API_SECRET;

    console.log('✅ Cloudflare Environment Polyfilled');
});
