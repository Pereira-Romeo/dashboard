ALTER TABLE `github_connections` DROP FOREIGN KEY `github_connections_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `steam_connections` DROP FOREIGN KEY `steam_connections_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `users` ADD `email_verified` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verification_token` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `verification_token_expires` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `verification_last_sent_at` timestamp;--> statement-breakpoint
ALTER TABLE `github_connections` ADD CONSTRAINT `github_connections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `steam_connections` ADD CONSTRAINT `steam_connections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;