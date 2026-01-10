import { db } from '../utils/db'
import { users, invitations, orders } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { isProtectedEmail, getPlanLimits, type AdminUser } from '../utils/admin-helpers'

export default defineEventHandler(async (event) => {
    // Consistent auth pattern
    const user = event.context.user as any
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const isAdmin = user.role === 'admin'
    const isSuperuser = user.role === 'superuser'
    const isStaff = user.role === 'staff'

    if (!isAdmin && !isStaff && !isSuperuser) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    // GET: List all users with their invitation usage
    if (event.method === 'GET') {
        try {
            const usersList = await db.select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                plan: users.plan,
                maxInvitations: users.maxInvitations,
                maxGuests: users.maxGuests,
                referralBalance: users.referralBalance,
                usage: sql<number>`(SELECT COUNT(*) FROM invitation WHERE owner = ${users.email})`
            }).from(users)

            return usersList
        } catch (e: any) {
            throw createError({ statusCode: 500, statusMessage: 'Failed to fetch users' })
        }
    }

    // POST: Manage Users - ADMIN/SUPERUSER only
    if (event.method === 'POST') {
        if (!isAdmin && !isSuperuser) {
            throw createError({ statusCode: 403, statusMessage: 'Admin only' })
        }

        const body = await readBody(event)
        const { action, email } = body

        if (!email) {
            throw createError({ statusCode: 400, statusMessage: 'Email is required' })
        }

        // EDIT USER
        if (action === 'edit') {
            const plan = body.plan || 'free'
            const limits = getPlanLimits(plan)

            try {
                await db.update(users).set({
                    plan: plan,
                    maxInvitations: body.maxInvitations ?? limits.maxInvitations,
                    maxGuests: body.maxGuests ?? limits.maxGuests,
                    updatedAt: new Date()
                }).where(eq(users.email, email))

                return { success: true }
            } catch (e: any) {
                throw createError({ statusCode: 500, statusMessage: 'Failed to update user' })
            }
        }

        // DELETE USER
        if (action === 'delete') {
            // Safety: Cannot delete protected emails
            if (isProtectedEmail(email)) {
                throw createError({ statusCode: 400, statusMessage: 'Cannot delete protected admin account' })
            }

            // Safety: Cannot delete self
            if (email === user.email) {
                throw createError({ statusCode: 400, statusMessage: 'Cannot delete your own account' })
            }

            try {
                // Get user ID first
                const [targetUser] = await db.select().from(users).where(eq(users.email, email))
                if (!targetUser) {
                    throw createError({ statusCode: 404, statusMessage: 'User not found' })
                }

                // Note: Ideally should cascade delete invitations, orders, etc.
                // For now, just delete user - foreign keys should be set to CASCADE or SET NULL in schema
                await db.delete(users).where(eq(users.email, email))

                return { success: true }
            } catch (e: any) {
                if (e.statusCode) throw e
                throw createError({ statusCode: 500, statusMessage: 'Failed to delete user' })
            }
        }

        throw createError({ statusCode: 400, statusMessage: 'Invalid action' })
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
