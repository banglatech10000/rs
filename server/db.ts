import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  activityLogs,
  blogPosts,
  contactMessages,
  experiences,
  pageViews,
  portfolioSettings,
  projects,
  skills,
  users,
} from "../drizzle/schema";
import { demoExperiences, demoPosts, demoProjects, demoSkills, defaultSettings, PortfolioSettings } from "../shared/portfolio";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let seedPromise: Promise<void> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
    updateSet.lastSignedIn = values.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

function parseData(value: string | null | undefined) {
  try { return value ? JSON.parse(value) : {}; } catch { return {}; }
}

function toItem(row: any, kind: "project" | "experience" | "skill" | "post") {
  return { ...row, id: row.id, kind, data: parseData(row.data), featured: Boolean(row.featured) };
}

export async function seedPortfolio() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const db = await getDb();
    if (!db) return;
    const existing = await db.select({ id: portfolioSettings.id }).from(portfolioSettings).limit(1);
    if (existing.length) return;
    await db.insert(portfolioSettings).values(defaultSettings);
    await db.insert(projects).values(demoProjects.map((item, index) => ({ title: item.title, slug: item.slug!, summary: item.summary!, body: item.body!, data: JSON.stringify(item.data), status: "published" as const, featured: item.featured ? 1 : 0, displayOrder: index })));
    await db.insert(experiences).values(demoExperiences.map((item, index) => ({ title: item.title, summary: item.summary!, body: item.body!, data: JSON.stringify(item.data), status: "published" as const, displayOrder: index })));
    await db.insert(skills).values(demoSkills.map((item, index) => ({ title: item.title, summary: item.summary ?? "", data: JSON.stringify(item.data), status: "published" as const, displayOrder: index })));
    await db.insert(blogPosts).values(demoPosts.map((item) => ({ title: item.title, slug: item.slug!, summary: item.summary!, body: item.body!, data: JSON.stringify(item.data), status: "published" as const, publishedAt: new Date() })));
  })().catch((error) => { seedPromise = null; console.warn("[Database] Seed skipped:", error); });
  return seedPromise;
}

export async function getPortfolioData() {
  await seedPortfolio();
  const db = await getDb();
  if (!db) return null;
  const [settings, projectRows, experienceRows, skillRows, postRows] = await Promise.all([
    db.select().from(portfolioSettings).limit(1),
    db.select().from(projects).where(eq(projects.status, "published")).orderBy(asc(projects.displayOrder)),
    db.select().from(experiences).where(eq(experiences.status, "published")).orderBy(asc(experiences.displayOrder)),
    db.select().from(skills).where(eq(skills.status, "published")).orderBy(asc(skills.displayOrder)),
    db.select().from(blogPosts).where(eq(blogPosts.status, "published")).orderBy(desc(blogPosts.publishedAt)),
  ]);
  return {
    settings: settings[0] ? { ...settings[0], linkedinUrl: settings[0].linkedinUrl ?? "", location: settings[0].location ?? "", availability: settings[0].availability ?? "", footerText: settings[0].footerText ?? "", accent: settings[0].accent ?? "lime" } : defaultSettings,
    projects: projectRows.map((row) => toItem(row, "project")),
    experiences: experienceRows.map((row) => toItem(row, "experience")),
    skills: skillRows.map((row) => toItem(row, "skill")),
    posts: postRows.map((row) => toItem(row, "post")),
  };
}

export async function getProjectBySlug(slug: string) {
  await seedPortfolio();
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return result[0] ? toItem(result[0], "project") : null;
}

export async function getPostBySlug(slug: string) {
  await seedPortfolio();
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0] ? toItem(result[0], "post") : null;
}

export async function createContact(input: { name: string; email: string; subject: string; message: string }) {
  const db = await getDb();
  if (!db) return { id: "local", ...input, status: "unread" };
  const inserted = await db.insert(contactMessages).values(input);
  return { id: Number(inserted[0].insertId), ...input, status: "unread" };
}

export async function getAdminOverview() {
  await seedPortfolio();
  const db = await getDb();
  if (!db) return { projects: 3, publishedPosts: 2, draftPosts: 0, unreadMessages: 0, skills: 6, experienceEntries: 1, pageViews: 0, githubRepositories: 0 };
  const [projectRows, posts, unread, skillRows, experienceRows, views] = await Promise.all([
    db.select().from(projects), db.select().from(blogPosts), db.select().from(contactMessages).where(eq(contactMessages.status, "unread")), db.select().from(skills), db.select().from(experiences), db.select().from(pageViews),
  ]);
  return { projects: projectRows.length, publishedPosts: posts.filter((post) => post.status === "published").length, draftPosts: posts.filter((post) => post.status === "draft").length, unreadMessages: unread.length, skills: skillRows.length, experienceEntries: experienceRows.length, pageViews: views.length, githubRepositories: 0 };
}

export async function getAdminContent() {
  await seedPortfolio();
  const db = await getDb();
  if (!db) return { projects: demoProjects, posts: demoPosts, messages: [] };
  const [projectRows, postRows, messages] = await Promise.all([db.select().from(projects).orderBy(asc(projects.displayOrder)), db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt)), db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt))]);
  return { projects: projectRows.map((row) => toItem(row, "project")), posts: postRows.map((row) => toItem(row, "post")), messages };
}

export async function updateSettings(input: Partial<PortfolioSettings>) {
  await seedPortfolio();
  const db = await getDb();
  if (!db) return { ...defaultSettings, ...input };
  const existing = await db.select({ id: portfolioSettings.id }).from(portfolioSettings).limit(1);
  if (!existing[0]) return null;
  await db.update(portfolioSettings).set(input).where(eq(portfolioSettings.id, existing[0].id));
  const result = await db.select().from(portfolioSettings).where(eq(portfolioSettings.id, existing[0].id)).limit(1);
  return result[0];
}

export async function updateProject(input: { id: number; status?: "draft" | "published" | "archived"; featured?: boolean }) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.update(projects).set({ ...(input.status ? { status: input.status } : {}), ...(input.featured === undefined ? {} : { featured: input.featured ? 1 : 0 }) }).where(eq(projects.id, input.id));
  return { success: true };
}

export async function createProject(input: { title: string; slug: string; summary: string; body: string; category: string }) {
  const db = await getDb();
  if (!db) return { id: "local", ...input, status: "draft" };
  const inserted = await db.insert(projects).values({ title: input.title, slug: input.slug, summary: input.summary, body: input.body, data: JSON.stringify({ category: input.category, technologies: [], gradient: "from-[#d8f26d] via-[#b7d7ed] to-[#7d91ff]" }), status: "draft", featured: 0, displayOrder: 99 });
  return { id: Number(inserted[0].insertId), ...input, status: "draft" };
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return { success: true };
  await db.delete(projects).where(eq(projects.id, id));
  return { success: true };
}

export async function updateMessage(id: number, status: "unread" | "read" | "archived") {
  const db = await getDb();
  if (!db) return { success: true };
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
  return { success: true };
}

export async function recordPageView(path: string, referrer = "", device = "unknown") {
  const db = await getDb();
  if (!db) return;
  await db.insert(pageViews).values({ path, referrer, device });
}

export async function logAdminAction(userId: number, action: string, target = "", metadata: Record<string, unknown> = {}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values({ userId, action, target, metadata: JSON.stringify(metadata) });
}
