CREATE TABLE `email_notification` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient` text NOT NULL,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'sent',
	`error` text,
	`createdAt` integer NOT NULL
);
