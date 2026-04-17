# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## SikaFields CMS — Sanity Integration

The Articles & Updates system supports two data sources:

1. **Static fallback** — `artifacts/sikafields/src/data/articles.ts` (always active, no config needed)
2. **Sanity CMS** — live data from Sanity Studio (active when `VITE_SANITY_PROJECT_ID` env var is set)

### Setup (Sanity)
1. Create a free account at [sanity.io](https://sanity.io)
2. Create a new project, note the **Project ID** and **Dataset** (default: `production`)
3. Set environment variables:
   - `SANITY_STUDIO_PROJECT_ID` — for the Sanity Studio UI
   - `SANITY_STUDIO_DATASET` — e.g. `production`
   - `VITE_SANITY_PROJECT_ID` — for the SikaFields frontend
   - `VITE_SANITY_DATASET` — e.g. `production`
4. Start the **artifacts/cms: Sanity Studio** workflow — navigate to it in the preview to publish content
5. Deploy the Sanity Studio publicly with `pnpm --filter @workspace/cms run deploy`

### CMS schemas (`artifacts/cms/schemas/`)
- `author.ts` — author profiles (name, role, photo, bio, LinkedIn)
- `blog.ts` — blog articles (title, slug, excerpt, cover image, author ref, tags, rich body, SEO)
- `news.ts` — news & updates (title, slug, summary, category, featured flag, rich body, SEO)

### Frontend data layer (`artifacts/sikafields/src/`)
- `lib/sanity.ts` — `@sanity/client` init, exports `isSanityConfigured` flag
- `lib/sanity-queries.ts` — GROQ queries for all articles, single article, related articles
- `lib/sanity-adapter.ts` — converts Sanity documents → `Article` type
- `hooks/useArticles.ts` — React Query hooks: `useAllArticles`, `useArticle(slug)`, `useRelatedArticles(slug, tags)`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/sikafields` (`@workspace/sikafields`)

React 19 + Vite landing page for SikaFields — a climate-tech carbon credit platform. Tailwind CSS, Framer Motion, Lucide React, react-simple-maps, react-countup, Wouter (client-side routing).

**Pages:**
- `/` — Landing page (all sections)
- `/advisory` — Advisory Board page
- `/faq` — FAQ page
- `/contact` — Contact page
- `/articles` — Articles & Updates list page (search, tag/type filtering, featured post)
- `/articles/:slug` — Single article/news detail page (author bio, share, related posts)

**Articles Content System** (`src/data/articles.ts`):
- Flat-file CMS — all content lives in `ARTICLES` array in `src/data/articles.ts`
- To add a post: copy an object, assign a unique `id`/`slug`, set `kind: "article" | "news"`, fill content blocks
- Content blocks: `{ type: "p" | "h2" | "quote" | "list", text?, items? }`
- Helper exports: `getArticleBySlug`, `getRelatedArticles`, `getAllTags`

**Key files:**
- `src/pages/Landing.tsx` — main landing page, all sections including nav
- `src/pages/Advisory.tsx` — executive team + advisory board
- `src/pages/Articles.tsx` — articles list
- `src/pages/ArticleDetail.tsx` — article detail
- `src/data/articles.ts` — all article/news content
- `public/leadership-team.png` — sprite sheet for executive photos
- `public/advisory-board.png` — sprite sheet for advisor photos
- `public/dr-kwame.jpeg` — standalone CTO photo
- `public/about-farming.jpg` — farming photo for About section

### AI Chat Assistant — "Ask Sika"

A floating AI chat widget powered by OpenAI via Replit AI Integrations (no API key required). The widget appears on all pages except admin and studio pages.

**Widget:** `artifacts/sikafields/src/components/ChatWidget.tsx`
- Fixed bottom-right green circular button
- Slide-up chat panel (370px × 560px) with Framer Motion animation
- Starter prompts shown on empty conversation
- SSE streaming responses (character-by-character)
- Conversation persisted in DB; ID stored in `localStorage` under `sf-chat-conversation-id`
- Suppressed on `/admin/*` and paths containing `/studio`

**API Routes:** `artifacts/api-server/src/routes/openai/index.ts`
- `POST /api/openai/conversations` — create conversation
- `GET /api/openai/conversations/:id` — get conversation with message history
- `DELETE /api/openai/conversations/:id` — delete conversation
- `GET /api/openai/conversations/:id/messages` — list messages
- `POST /api/openai/conversations/:id/messages` — send message, streams SSE response

**AI Provider:** `@workspace/integrations-openai-ai-server` — wraps OpenAI SDK initialized with `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` (auto-provisioned by Replit).

**DB Schema:** `lib/db/src/schema/conversations.ts` + `lib/db/src/schema/messages.ts` (tables: `conversations`, `messages` with foreign key cascade)

**Model:** `gpt-5.2` with `max_completion_tokens: 8192`, streaming enabled.

**System prompt:** Configures the assistant as "Sika", knowledgeable about SikaFields' programs (farmer enrollment, carbon credits, MRV, ESG), Ghana/India/Dubai operations, pricing ($15+/tonne), contact info.

### Authentication & Admin Access (Clerk)

Clerk powers all admin authentication for SikaFields. The home page and public marketing pages remain open to everyone — only the `/admin/*` area is protected.

**Setup**
- Auth pane in the workspace toolbar manages Clerk app branding, OAuth providers, and email templates.
- Env vars (auto-provisioned): `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`.
- **Public sign-up is invite-only (enforced).** The Clerk instance has `restrictions.allowlist = true` with an empty allowlist (set via `PATCH /v1/instance/restrictions`), which is Clerk's "Sign-up mode: Restricted" mechanism. Strangers visiting `/sign-up` cannot self-register. Existing users can still sign in (`allowlist_blocklist_disabled_on_sign_in = true`), and invitations created from `/admin/users` bypass the allowlist. To reopen public sign-ups, flip `allowlist` back to `false` in the Clerk dashboard ("Restrictions") or via the API. _Last verified: 2026-04-17 via `GET /v1/instance/restrictions` → `{"allowlist":true,"blocklist":false,"allowlist_blocklist_disabled_on_sign_in":true}`._

**First admin (bootstrap)**
1. Receive an invitation at `/sign-up` (open self-sign-up is disabled — see above).
2. In the Auth pane → Users → open your user → set Public metadata to `{"role": "admin"}`.
3. Visit `/admin/users` to invite teammates with `user` or `admin` roles directly from the UI.

> Status: `sikafield1@gmail.com` (`user_3CTubHjAojSxIMc9Os7M9ft5naH`) was bootstrapped as the first admin via the Clerk Backend API (`PATCH /v1/users/{id}/metadata`). Subsequent admins should be added through `/admin/users`.

**Roles**
- Stored in Clerk `publicMetadata.role` (`"admin"` | `"user"`).
- Client check: `useIsAdmin()` hook in `src/lib/auth.tsx`.
- Server check: `requireAdmin` middleware in `artifacts/api-server/src/middlewares/requireAdmin.ts` (calls `clerkClient.users.getUser(userId)` to read metadata — never trusts the JWT alone).

**Routes**
- `/sign-in`, `/sign-up` — themed Clerk components in `src/pages/SignIn.tsx`.
- `/admin/posts`, `/admin/new-post`, `/admin/users` — wrapped in `<RequireAdmin>` (`src/lib/auth.tsx`).
- Server admin API: `GET/POST/PATCH/DELETE /api/admin/users[...]` in `artifacts/api-server/src/routes/admin.ts`.

**Navbar (`src/pages/Landing.tsx`)**
- Signed-out users see a "Log In" button.
- Signed-in users see an avatar dropdown; admins get "Manage Posts" + "Manage Users" links.
- All sign-in state is gated with Clerk's `<Show when="signed-in">` / `<Show when="signed-out">`.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
