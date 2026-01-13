import { relations } from "drizzle-orm/relations";
import { invitation, guest, user, account, referralTransaction, session } from "./schema";

export const guestRelations = relations(guest, ({one}) => ({
	invitation: one(invitation, {
		fields: [guest.invitationSlug],
		references: [invitation.slug]
	}),
}));

export const invitationRelations = relations(invitation, ({many}) => ({
	guests: many(guest),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	referralTransactions_refereeId: many(referralTransaction, {
		relationName: "referralTransaction_refereeId_user_id"
	}),
	referralTransactions_referrerId: many(referralTransaction, {
		relationName: "referralTransaction_referrerId_user_id"
	}),
	sessions: many(session),
}));

export const referralTransactionRelations = relations(referralTransaction, ({one}) => ({
	user_refereeId: one(user, {
		fields: [referralTransaction.refereeId],
		references: [user.id],
		relationName: "referralTransaction_refereeId_user_id"
	}),
	user_referrerId: one(user, {
		fields: [referralTransaction.referrerId],
		references: [user.id],
		relationName: "referralTransaction_referrerId_user_id"
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));