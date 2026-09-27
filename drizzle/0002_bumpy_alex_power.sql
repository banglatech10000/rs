ALTER TABLE `activityLogs` MODIFY COLUMN `metadata` text NOT NULL;--> statement-breakpoint
ALTER TABLE `blogPosts` MODIFY COLUMN `data` text NOT NULL;--> statement-breakpoint
ALTER TABLE `experiences` MODIFY COLUMN `data` text NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `data` text NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` MODIFY COLUMN `data` text NOT NULL;
