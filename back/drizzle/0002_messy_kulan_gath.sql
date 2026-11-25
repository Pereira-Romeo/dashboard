CREATE TABLE `github_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`access_token` varchar(512) NOT NULL,
	`github_username` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `github_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_github_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `github_connections` ADD CONSTRAINT `github_connections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;