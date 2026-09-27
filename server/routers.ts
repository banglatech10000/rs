import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createContact, createProject, deleteProject, getAdminContent, getAdminOverview, getPostBySlug, getPortfolioData, getProjectBySlug, logAdminAction, recordPageView, updateMessage, updateProject, updateSettings } from "./db";

const settingsInput = z.object({
  siteName: z.string().min(1).max(120).optional(),
  headline: z.string().min(1).max(180).optional(),
  heroLabel: z.string().min(1).max(120).optional(),
  bio: z.string().min(1).max(2000).optional(),
  email: z.string().email().max(320).optional(),
  githubUsername: z.string().max(120).optional(),
  githubUrl: z.string().url().or(z.literal("")).optional(),
  linkedinUrl: z.string().url().or(z.literal("")).optional(),
  location: z.string().max(160).optional(),
  availability: z.string().max(180).optional(),
  footerText: z.string().max(240).optional(),
  accent: z.string().max(40).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  portfolio: router({
    get: publicProcedure.query(() => getPortfolioData()),
    project: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getProjectBySlug(input.slug)),
    post: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getPostBySlug(input.slug)),
  }),
  contact: router({
    submit: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().email().max(320), subject: z.string().trim().min(2).max(220), message: z.string().trim().min(10).max(5000), honeypot: z.string().max(0).optional() })).mutation(async ({ input }) => {
      if (input.honeypot) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to submit message." });
      const { honeypot: _honeypot, ...message } = input;
      return createContact(message);
    }),
  }),
  analytics: router({
    pageView: publicProcedure.input(z.object({ path: z.string().max(240), referrer: z.string().max(500).optional(), device: z.string().max(40).optional() })).mutation(({ input }) => recordPageView(input.path, input.referrer, input.device)),
  }),
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    content: adminProcedure.query(() => getAdminContent()),
    updateSettings: adminProcedure.input(settingsInput).mutation(async ({ ctx, input }) => {
      const result = await updateSettings(input);
      if (result && ctx.user) await logAdminAction(ctx.user.id, "settings.updated", "portfolioSettings", { fields: Object.keys(input) });
      return result;
    }),
    updateProject: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "published", "archived"]).optional(), featured: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
      const result = await updateProject(input);
      if (ctx.user) await logAdminAction(ctx.user.id, "project.updated", String(input.id), input);
      return result;
    }),
    createProject: adminProcedure.input(z.object({ title: z.string().trim().min(2).max(180), slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(180), summary: z.string().trim().min(10).max(1000), body: z.string().trim().min(10).max(10000), category: z.string().trim().min(2).max(40) })).mutation(async ({ ctx, input }) => {
      const result = await createProject(input);
      if (ctx.user) await logAdminAction(ctx.user.id, "project.created", input.slug);
      return result;
    }),
    deleteProject: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const result = await deleteProject(input.id);
      if (ctx.user) await logAdminAction(ctx.user.id, "project.deleted", String(input.id));
      return result;
    }),
    updateMessage: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["unread", "read", "archived"]) })).mutation(async ({ ctx, input }) => {
      const result = await updateMessage(input.id, input.status);
      if (ctx.user) await logAdminAction(ctx.user.id, "message.updated", String(input.id), input);
      return result;
    }),
  }),
});

export type AppRouter = typeof appRouter;
