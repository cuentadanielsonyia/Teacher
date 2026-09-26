CREATE TABLE `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`skill` text NOT NULL,
	`category` text NOT NULL,
	`prompt` text NOT NULL,
	`answer` text NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`level` text DEFAULT 'B1' NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`last_study` text
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`started` text NOT NULL,
	`duration_sec` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vocab` (
	`word` text PRIMARY KEY NOT NULL,
	`seen` integer DEFAULT 1 NOT NULL,
	`mastered` integer DEFAULT 0 NOT NULL,
	`next_review` text
);
