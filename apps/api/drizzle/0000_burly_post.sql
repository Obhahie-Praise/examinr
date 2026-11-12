CREATE TABLE `ai_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text DEFAULT 'gemini' NOT NULL,
	`name` text NOT NULL,
	`encrypted_key` text NOT NULL,
	`key_iv` text NOT NULL,
	`key_version` integer DEFAULT 1 NOT NULL,
	`masked_key` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_used_at` integer,
	`last_successful_use_at` integer,
	`last_error_category` text,
	`cooldown_until` integer,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_credentials_status_idx` ON `ai_credentials` (`status`);--> statement-breakpoint
CREATE INDEX `ai_credentials_last_used_idx` ON `ai_credentials` (`last_used_at`);--> statement-breakpoint
CREATE INDEX `ai_credentials_provider_idx` ON `ai_credentials` (`provider`);--> statement-breakpoint
CREATE TABLE `ai_route_events` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`credential_id` text,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`event_type` text NOT NULL,
	`error_category` text,
	`cooldown_seconds` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_route_request_idx` ON `ai_route_events` (`request_id`);--> statement-breakpoint
CREATE INDEX `ai_route_credential_idx` ON `ai_route_events` (`credential_id`);--> statement-breakpoint
CREATE INDEX `ai_route_created_at_idx` ON `ai_route_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `ai_usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`credential_id` text,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`modality` text DEFAULT 'text' NOT NULL,
	`task_type` text,
	`user_id` text,
	`input_tokens` integer,
	`output_tokens` integer,
	`total_tokens` integer,
	`latency_ms` integer,
	`status` text NOT NULL,
	`error_category` text,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`request_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_usage_credential_idx` ON `ai_usage_events` (`credential_id`);--> statement-breakpoint
CREATE INDEX `ai_usage_created_at_idx` ON `ai_usage_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `ai_usage_status_idx` ON `ai_usage_events` (`status`);--> statement-breakpoint
CREATE INDEX `ai_usage_provider_model_idx` ON `ai_usage_events` (`provider`,`model`);