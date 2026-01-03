CREATE TABLE `wa_notification` (
	`id` text PRIMARY KEY NOT NULL,
	`phoneNumber` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
