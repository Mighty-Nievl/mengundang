import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const code = query.code as string

    if (!code) throw createError({ statusCode: 400, statusMessage: 'No code provided' })

    const REDIRECT_URI = `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/google/callback`

    // Exchange Code for Token
    const tokenResponse = await $fetch<any>('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code,
            client_id: config.googleClientId,
            client_secret: config.googleClientSecret,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }).toString()
    })

    const { access_token } = tokenResponse

    // Get User Info
    const userInfo = await $fetch<any>('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
    })

    const { email, name, picture } = userInfo

    // User Management
    const usersPath = resolve(process.cwd(), 'data/users.json')
    if (!existsSync(usersPath)) writeFileSync(usersPath, '[]')

    let users = JSON.parse(readFileSync(usersPath, 'utf-8'))
    let user = users.find((u: any) => u.email === email)

    if (!user) {
        // Register New User
        user = {
            email,
            name,
            picture, // Optional: save google avatar
            role: 'user',
            plan: 'free',
            maxInvitations: 1,
            authProvider: 'google',
            createdAt: new Date().toISOString()
        }
        users.push(user)
        writeFileSync(usersPath, JSON.stringify(users, null, 2))
    }

    // Create Session
    const token = randomUUID()
    const sessionToken = {
        email: user.email,
        role: user.role,
        name: user.name,
        plan: user.plan || 'free',
        maxInvitations: user.maxInvitations || 1,
        picture: user.picture,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
    }

    const sessionsPath = resolve(process.cwd(), 'data/sessions.json')
    let sessions: any = {}
    if (existsSync(sessionsPath)) sessions = JSON.parse(readFileSync(sessionsPath, 'utf-8'))

    sessions[token] = sessionToken
    writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2))

    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    })

    return sendRedirect(event, '/admin')
})
