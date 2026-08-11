CREATE TABLE `player_profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`profile_json` text NOT NULL,
	`settings_json` text NOT NULL,
	`save_json` text,
	`updated_at` integer NOT NULL
);
