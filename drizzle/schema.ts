import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const portfolioSettings = mysqlTable("portfolioSettings", {
  id: int("id").autoincrement().primaryKey(),
  siteName: varchar("siteName", { length: 120 }).notNull(),
  headline: varchar("headline", { length: 180 }).notNull(),
  heroLabel: varchar("heroLabel", { length: 120 }).notNull(),
  bio: text("bio").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  githubUsername: varchar("githubUsername", { length: 120 }).notNull(),
  githubUrl: varchar("githubUrl", { length: 500 }).notNull(),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }).default(""),
  location: varchar("location", { length: 160 }).default(""),
  availability: varchar("availability", { length: 180 }).default(""),
  footerText: varchar("footerText", { length: 240 }).default(""),
  accent: varchar("accent", { length: 40 }).default("lime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  data: text("data").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  featured: int("featured").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const experiences = mysqlTable("experiences", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  data: text("data").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 120 }).notNull(),
  summary: varchar("summary", { length: 240 }).default(""),
  data: text("data").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  data: text("data").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 220 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["unread", "read", "archived"]).default("unread").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 160 }).notNull(),
  target: varchar("target", { length: 180 }).default(""),
  metadata: text("metadata").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pageViews = mysqlTable("pageViews", {
  id: int("id").autoincrement().primaryKey(),
  path: varchar("path", { length: 240 }).notNull(),
  referrer: varchar("referrer", { length: 500 }).default(""),
  device: varchar("device", { length: 40 }).default("unknown"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
