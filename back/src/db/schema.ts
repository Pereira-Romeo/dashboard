import { mysqlTable, int, varchar, timestamp, unique, tinyint, json } from "drizzle-orm/mysql-core";

//users table
export const users = mysqlTable("users", {
    id: int("id").primaryKey().autoincrement().unique(),
    name: varchar("name", {length: 255}).notNull().default("Nameless"),
    email: varchar("email", {length: 255}).notNull().unique(),
    password: varchar("password", {length: 255}).notNull(),
    avatar: varchar("avatar", {length: 255}).default(""), //path to the profile picture
    emailVerified: tinyint("email_verified").notNull().default(0),
    verificationToken: varchar("verification_token", { length: 64 }),
    verificationTokenExpires: timestamp("verification_token_expires"),
    verificationLastSentAt: timestamp("verification_last_sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})


//api key providers table
export const apiUsage = mysqlTable("api_usage", {
    id: int("id").primaryKey().autoincrement(),
    provider: varchar("provider", { length: 100 }).notNull(),
    date: varchar("date", { length: 10 }).notNull(),
    count: int("count").notNull().default(0),
    },
    (table) => [unique("provider_date_unique").on(table.provider, table.date)]
);

//github credentials table
export const githubConnections = mysqlTable("github_connections", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    accessToken: varchar("access_token", { length: 512 }).notNull(),
    githubUsername: varchar("github_username", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    },
  (table) => [unique("user_github_unique").on(table.userId)]
);

//steam user ids table
export const steamConnections = mysqlTable("steam_connections", {
        id: int("id").primaryKey().autoincrement(),
        userId: int("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
        steamId64: varchar("steam_id_64", { length: 32 }).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [unique("user_steam_unique").on(table.userId)]
);

export const userWidgets = mysqlTable(
  "user_widgets",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    widgetId: varchar("widget_id", { length: 64 }).notNull(),
    instanceId: varchar("instance_id", { length: 64 }).notNull(),
    x: int("x").notNull(),
    y: int("y").notNull(),
    width: int("width").notNull(),
    height: int("height").notNull(),
    params: json("params").$type<Record<string, string | number | boolean>>().notNull(),
  },
  (table) => [unique("user_instance_unique").on(table.userId, table.instanceId)]
);

