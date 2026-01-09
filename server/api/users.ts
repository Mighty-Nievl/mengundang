import { db } from '../utils/db'
import { users, invitations } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { auth } from '../utils/auth'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Role Check
    const sessionUser = user as any
    const isAdmin = sessionUser.role === 'admin'
    const isStaff = sessionUser.role === 'staff'
    const isSuperuser = sessionUser.role === 'superuser'

    if (!isAdmin && !isStaff && !isSuperuser) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Access required' })
    }

    // GET: List all users with their invitation usage
    if (event.method === 'GET') {
        const usersList = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            plan: users.plan,
            maxInvitations: users.maxInvitations,
            maxGuests: users.maxGuests,
            usage: sql<number>`(SELECT COUNT(*) FROM invitation WHERE owner = ${users.email})`
        }).from(users)

        return usersList
    }

    // POST: Manage Users (Update Plan / Max Invitations / Delete) - ONLY ADMIN
    if (event.method === 'POST') {
        if (!isAdmin && !isSuperuser) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin only' })
        }
        const body = await readBody(event)
        const { action, email } = body

        if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' })

        if (action === 'edit') {
            await db.update(users).set({
                plan: body.plan,
                maxInvitations: parseInt(body.maxInvitations) || 1,
                maxGuests: parseInt(body.maxGuests) || 25,
                updatedAt: new Date()
            }).where(eq(users.email, email))

            return { success: true }
        }

        if (action === 'add') {
            const { name, password } = body
            if (!name || !password) throw createError({ statusCode: 400, statusMessage: 'Name and Password required' })

            try {
                // Check if user exists
                const existing = await db.select().from(users).where(eq(users.email, email))
                if (existing.length > 0) {
                    throw createError({ statusCode: 400, statusMessage: 'Email already registered' })
                }

                await auth.api.signUpEmail({
                    body: {
                        email,
                        password,
                        name,
                        role: 'user',
                        plan: 'free',
                        maxInvitations: 1
                    }
                })

                return { success: true }
            } catch (e: any) {
                throw createError({ statusCode: 400, statusMessage: e.message || 'Failed to create user' })
            }
        }

        if (action === 'delete') {
            // Safety check: Cannot delete super admin
            const protectedEmails = ['support@zalan.web.id', 'rezalhbramantara@gmail.com']
            if (protectedEmails.includes(email)) {
                throw createError({ statusCode: 400, statusMessage: 'Cannot delete Super Admin' })
            }

            // In Better-Auth, deleting a user usually requires deleting their sessions/accounts too
            // Drizzle schema has references, depends on cascade setup. 
            // For now, let's just delete from user table.
            await db.delete(users).where(eq(users.email, email))
            return { success: true }
        }

        throw createError({ statusCode: 400, statusMessage: 'Invalid Action' })
    }
})
