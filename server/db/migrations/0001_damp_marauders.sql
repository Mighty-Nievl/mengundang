CREATE TABLE `guest` (
	`id` text PRIMARY KEY NOT NULL,
	`invitationSlug` text NOT NULL,
	`name` text NOT NULL,
	`phoneNumber` text,
	`note` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`invitationSlug`) REFERENCES `invitation`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `system_setting` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updatedAt` integer NOT NULL
);
