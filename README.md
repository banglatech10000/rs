# Robiul — Personal Portfolio

A premium, database-backed personal portfolio and CMS for **ROBIUL**. The public site is intentionally restrained and editorial; the admin workspace makes the content editable without inventing personal claims.

## Included

- Responsive public portfolio: home, about, projects, project details, experience, skills, blog, GitHub, contact, resume, and branded 404
- Dark-first visual system with optional light mode, original R lettermark, motion-safe CSS, accessible focus states, and responsive mobile navigation
- Database-backed content for settings, projects, experience, skills, blog posts, contact messages, page views, and activity logs
- Protected admin workspace at `/admin` using the scaffold's secure Manus session and admin role guard
- CMS controls for profile/settings, project creation, publish/unpublish, feature/unfeature, delete, message inbox, and activity-ready audit events
- Server-side Zod validation for contact forms and admin content operations
- Server-side tRPC procedures; no private GitHub credentials are sent to the browser
- PWA metadata, favicon, SEO defaults, and resume placeholder slot

## Architecture

```text
React + Vite + Tailwind
          ↓
      tRPC router
          ↓
   Drizzle ORM / MySQL-TiDB
          ↓
  portfolioSettings / projects / blogPosts / messages / logs
```

The scaffold provides Manus OAuth, session cookies, database access, storage helpers, and the managed preview server. Public reads are in `server/db.ts` and `server/routers.ts`; admin writes use `adminProcedure` and record activity events where applicable.

## Local development

```bash
pnpm install
pnpm dev
```

Then open the printed local preview URL. The managed WebDev environment also exposes the project preview URL in the project status.

## Database

The schema lives in `drizzle/schema.ts`. The current content tables are:

- `portfolioSettings`
- `projects`
- `experiences`
- `skills`
- `blogPosts`
- `contactMessages`
- `activityLogs`
- `pageViews`

The first run seeds clearly marked demo content only. Replace it from the admin workspace before launch. The schema is intentionally compatible with the managed TiDB/MySQL runtime; text JSON columns are initialized explicitly in server code instead of using unsupported text defaults.

## Environment

See `.env.example`. The managed environment supplies `DATABASE_URL`, `JWT_SECRET`, Manus OAuth values, and built-in API credentials. Optional future integrations include GitHub, email notifications, and external media storage.

Never commit real secrets or put private tokens in `VITE_*` variables.

## Useful commands

```bash
pnpm test     # Vitest unit tests
pnpm check    # TypeScript check
pnpm build    # Vite + server production build
pnpm format   # Prettier
```

## Admin setup

The admin area is protected by the existing secure session and `adminProcedure`. The owner account is promoted using the configured owner identity; no password is hard-coded or printed. If an account is authenticated but not an admin, `/admin` shows a protected access message rather than exposing CMS data.

## Deployment notes

- Frontend and API are served by the managed WebDev runtime in one project, but the UI still talks to the server through typed `/api/trpc` procedures.
- For a separate deployment, keep the database connection server-side and point the frontend API client at the environment-specific server URL.
- Supply a real `resume.pdf`, profile image, project media, GitHub username, social links, and personal copy before public launch.
- The starter's demo entries are labelled with `DEMO` / `YOUR ...` markers to prevent accidental fabricated claims.
