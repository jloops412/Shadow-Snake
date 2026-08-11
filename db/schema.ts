import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const playerProfiles = sqliteTable("player_profiles", {
  email: text("email").primaryKey(),
  displayName: text("display_name").notNull(),
  profileJson: text("profile_json").notNull(),
  settingsJson: text("settings_json").notNull(),
  saveJson: text("save_json"),
  updatedAt: integer("updated_at").notNull(),
});
