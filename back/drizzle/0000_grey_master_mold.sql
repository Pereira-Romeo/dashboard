CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'Nameless',
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`avatar` varchar(255) DEFAULT '',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_id_unique` UNIQUE(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
