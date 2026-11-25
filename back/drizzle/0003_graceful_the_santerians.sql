CREATE TABLE `steam_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`steam_id_64` varchar(32) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `steam_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_steam_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `steam_connections` ADD CONSTRAINT `steam_connections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;