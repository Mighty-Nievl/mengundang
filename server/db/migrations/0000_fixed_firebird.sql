CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invitation` (
	`slug` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`partnerEmail` text,
	`content` text DEFAULT '{}',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`plan` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending',
	`proofUrl` text,
	`referrerId` text,
	`referralDiscount` integer DEFAULT 0,
	`ipAddress` text,
	`externalId` text,
	`paymentUrl` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `referral_transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`referrerId` text NOT NULL,
	`refereeId` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`referrerId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`refereeId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`role` text DEFAULT 'user',
	`plan` text DEFAULT 'free',
	`planExpiresAt` integer,
	`maxInvitations` integer DEFAULT 1,
	`maxGuests` integer DEFAULT 25,
	`referralCode` text,
	`referredBy` text,
	`referralBalance` integer DEFAULT 0,
	`phoneNumber` text,
	`bankName` text,
	`bankAccountNumber` text,
	`bankAccountName` text,
	`registrationIp` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_referralCode_unique` ON `user` (`referralCode`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
