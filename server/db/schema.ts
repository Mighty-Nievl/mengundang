import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
    image: text('image'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
    // Custom Fields
    role: text('role').default('user'),
    plan: text('plan').default('free'), // free, regular, vip, vvip
    planExpiresAt: integer('planExpiresAt', { mode: 'timestamp' }),
    maxInvitations: integer('maxInvitations').default(1),
    maxGuests: integer('maxGuests').default(25),
    // Referral System
    referralCode: text('referralCode').unique(),
    referredBy: text('referredBy'), // Valid referral code of the referrer
    referralBalance: integer('referralBalance').default(0),
    // Bank Account Info (for Payouts)
    phoneNumber: text('phoneNumber'),
    bankName: text('bankName'),
    bankAccountNumber: text('bankAccountNumber'),
    bankAccountName: text('bankAccountName'),
    payoutPending: integer('payoutPending', { mode: 'boolean' }).default(false),
    registrationIp: text('registrationIp')
});

export const referralTransactions = sqliteTable('referral_transaction', {
    id: text('id').primaryKey(),
    referrerId: text('referrerId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    refereeId: text('refereeId').notNull().references(() => users.id, { onDelete: 'cascade' }), // The user who made the purchase
    amount: integer('amount').notNull(),
    type: text('type').notNull(), // 'bonus', 'withdrawal'
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull()
});

export const sessions = sqliteTable('session', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const accounts = sqliteTable('account', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const verifications = sqliteTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
});

export const invitations = sqliteTable('invitation', {
    slug: text('slug').primaryKey(),
    owner: text('owner').notNull(),
    partnerEmail: text('partnerEmail'),
    content: text('content', { mode: 'json' }).default('{}'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const orders = sqliteTable('order', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(), // No foreign key constraint to keep it simple for now, or add .references(() => users.id)
    plan: text('plan').notNull(), // regular, vip, vvip
    amount: integer('amount').notNull(),
    status: text('status').default('pending'), // pending, approved, rejected
    proofUrl: text('proofUrl'),
    // Referral Tracking
    referrerId: text('referrerId'), // The user ID of the person who gets the bonus
    referralDiscount: integer('referralDiscount').default(0),
    ipAddress: text('ipAddress'), // For anti-fraud
    externalId: text('externalId'), // Flip Bill ID
    paymentUrl: text('paymentUrl'), // Flip Redirect URL
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});
export const guests = sqliteTable('guest', {
    id: text('id').primaryKey(),
    invitationSlug: text('invitationSlug').notNull().references(() => invitations.slug, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    phoneNumber: text('phoneNumber'),
    note: text('note'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const systemSettings = sqliteTable('system_setting', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const waNotifications = sqliteTable('wa_notification', {
    id: text('id').primaryKey(),
    phoneNumber: text('phoneNumber').notNull(),
    message: text('message').notNull(),
    status: text('status').default('pending'), // pending, sent, failed
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const emailNotifications = sqliteTable('email_notification', {
    id: text('id').primaryKey(),
    recipient: text('recipient').notNull(),
    subject: text('subject').notNull(),
    content: text('content').notNull(),
    status: text('status').default('sent'), // sent, failed
    error: text('error'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull()
});
