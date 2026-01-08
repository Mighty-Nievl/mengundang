import { auth } from '../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({
        headers: event.headers
    })
    return {
        status: 'ok',
        session: session,
        cookie: getHeader(event, 'cookie'),
        host: getHeader(event, 'host'),
        protocol: getHeader(event, 'x-forwarded-proto')
    }
})
