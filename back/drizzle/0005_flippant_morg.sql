CREATE TABLE `user_widgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`widget_id` varchar(64) NOT NULL,
	`instance_id` varchar(64) NOT NULL,
	`x` int NOT NULL,
	`y` int NOT NULL,
	`width` int NOT NULL,
	`height` int NOT NULL,
	`params` json NOT NULL,
	CONSTRAINT `user_widgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_instance_unique` UNIQUE(`user_id`,`instance_id`)
);
--> statement-breakpoint
ALTER TABLE `user_widgets` ADD CONSTRAINT `user_widgets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;