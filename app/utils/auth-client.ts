import { createAuthClient } from "better-auth/vue"

let _authClient: ReturnType<typeof createAuthClient> | null = null

export const useAuthClient = () => {
    if (!_authClient) {
        _authClient = createAuthClient({
            baseURL: useRuntimeConfig().public.betterAuthUrl
        })
    }
    return _authClient
}
