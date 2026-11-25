CREATE TABLE `api_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(100) NOT NULL,
	`date` varchar(10) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	CONSTRAINT `api_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `provider_date_unique` UNIQUE(`provider`,`date`)
);
