import { useAuthClient } from '../utils/auth-client'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()

    if (!data?.user) {
        return navigateTo('/login')
    }

    const allowedRoles = ['admin', 'staff', 'superuser']
    if (!allowedRoles.includes(data.user.role)) {
        return navigateTo('/dashboard')
    }
})
