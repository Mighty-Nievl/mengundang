import { useAuthClient } from '../utils/auth-client'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()

    if (!data?.user) {
        return navigateTo('/login')
    }

    if (data.user.role !== 'admin' && data.user.role !== 'staff') {
        return navigateTo('/dashboard')
    }
})
