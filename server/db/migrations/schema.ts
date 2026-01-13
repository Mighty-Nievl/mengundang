import { sqliteTable, AnySQLiteColumn, text, integer, uniqueIndex, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const invitation = sqliteTable("invitation", {
	slug: text().primaryKey().notNull(),
	owner: text().notNull(),
	partnerEmail: text(),
	content: text().default("{}"),
	createdAt: integer().notNull(),
	updatedAt: integer().notNull(),
});

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer().notNull(),
	image: text(),
	createdAt: integer().notNull(),
	updatedAt: integer().notNull(),
	role: text().default("user"),
	plan: text().default("free"),
	planExpiresAt: integer(),
	maxInvitations: integer().default(1),
	maxGuests: integer().default(25),
	referralCode: text(),
	referredBy: text(),
	referralBalance: integer().default(0),
	phoneNumber: text(),
	bankName: text(),
	bankAccountNumber: text(),
	bankAccountName: text(),
	registrationIp: text(),
	payoutPending: integer().default(false),
},
(table) => [
	uniqueIndex("user_referralCode_unique").on(table.referralCode),
	uniqueIndex("user_email_unique").on(table.email),
]);

export const emailNotification = sqliteTable("email_notification", {
	id: text().primaryKey().notNull(),
	recipient: text().notNull(),
	subject: text().notNull(),
	content: text().notNull(),
	status: text().default("sent"),
	error: text(),
	createdAt: integer().notNull(),
});

export const order = sqliteTable("order", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	plan: text().notNull(),
	amount: integer().notNull(),
	status: text().default("pending"),
	proofUrl: text(),
	referrerId: text(),
	referralDiscount: integer().default(0),
	ipAddress: text(),
	externalId: text(),
	paymentUrl: text(),
	createdAt: integer().notNull(),
	updatedAt: integer().notNull(),
});

export const systemSetting = sqliteTable("system_setting", {
	key: text().primaryKey().notNull(),
	value: text().notNull(),
	updatedAt: integer().notNull(),
});

export const verification = sqliteTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: integer().notNull(),
	createdAt: integer(),
	updatedAt: integer(),
});

export const waNotification = sqliteTable("wa_notification", {
	id: text().primaryKey().notNull(),
	phoneNumber: text().notNull(),
	message: text().notNull(),
	status: text().default("pending"),
	createdAt: integer().notNull(),
	updatedAt: integer().notNull(),
});

export const guest = sqliteTable("guest", {
	id: text().primaryKey().notNull(),
	invitationSlug: text().notNull().references(() => invitation.slug, { onDelete: "cascade" } ),
	name: text().notNull(),
	phoneNumber: text(),
	note: text(),
	createdAt: integer().notNull(),
	updatedAt: integer().notNull(),
});

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	userId: text().notNull().references(() => user.id, { onDelete: "cascade" } ),
	accountId: text().notNull(),
	providerId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: integer(),
	refreshTokenExpiresAt: integer(),
	scope: text(),
	password: text(),
	createdAt: integer().notNull(),
	updatedAt: integer().notNull(),
});

export const referralTransaction = sqliteTable("referral_transaction", {
	id: text().primaryKey().notNull(),
	referrerId: text().notNull().references(() => user.id, { onDelete: "cascade" } ),
	refereeId: text().notNull().references(() => user.id, { onDelete: "cascade" } ),
	amount: integer().notNull(),
	type: text().notNull(),
	createdAt: integer().notNull(),
});

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	userId: text().notNull().references(() => user.id, { onDelete: "cascade" } ),
	token: text().notNull(),
	expiresAt: integer().notNull(),
	ipAddress: text(),
	userAgent: text(),
	createdAt: integer().notNull(),
	updatedAt: integer().notNull(),
},
(table) => [
	uniqueIndex("session_token_unique").on(table.token),
]);

