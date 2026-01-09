import { useAuthClient } from '../utils/auth-client'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const authClient = useAuthClient()
    const { data } = await authClient.getSession({
        fetchOptions: {
            headers: useRequestHeaders(['cookie'])
        }
    })

    if (!data?.user) {
        return navigateTo('/login')
    }

    const user = data.user as any
    const allowedRoles = ['admin', 'staff', 'superuser']
    if (!allowedRoles.includes(user.role)) {
        return navigateTo('/dashboard')
    }
})
