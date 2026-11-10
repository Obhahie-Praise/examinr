# Examinr API

The backend API for Examinr — an AI-powered examination preparation and personalised learning platform.

Built with Hono running on Cloudflare Workers, with Cloudflare D1 as the database.

---

## Architecture

| Concern | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| Framework | Hono |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle ORM |
| Authentication | Better Auth |
| File uploads | UploadThing |
| AI provider | Google Gemini |
| Language | TypeScript |

The API is a lightweight, modular Hono application. Each concern is separated:

```
src/
  index.ts              Application entry point and middleware
  auth/
    auth.ts             Better Auth configuration
  db/
    index.ts            Drizzle ORM setup
    schema/
      index.ts          Application schema (empty until features are added)
  lib/
    ai/
      gemini.ts         Google Gemini client factory
    storage/
      uploadthing.ts    UploadThing server integration
  routes/
    health.ts           Health check endpoints
    me.ts               Authenticated user endpoint
```

---

## Environment Variables

All variables are read from the Cloudflare Worker environment.

For local development, copy `dev.vars.example` to `.dev.vars` and fill in the values. Wrangler reads `.dev.vars` automatically at startup.

| Variable | Required | Purpose |
|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | Better Auth signing secret (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | API base URL |
| `WEB_APP_URL` | Yes | Trusted web application origin (for CORS and Better Auth) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `UPLOADTHING_TOKEN` | Yes | UploadThing server token |
| `CLOUDFLARE_ACCOUNT_ID` | Remote migrations only | Cloudflare account ID |
| `CLOUDFLARE_DATABASE_ID` | Remote migrations only | D1 database ID |
| `CLOUDFLARE_API_TOKEN` | Remote migrations only | Cloudflare API token |

**Production secrets** must never be in source files. Configure them using Wrangler:

```
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put UPLOADTHING_TOKEN
```

---

## D1 Configuration

The D1 database is bound to the Worker as `DB`.

| Property | Value |
|---|---|
| Binding name | `DB` |
| Database name | `examinr-dev` |
| Database ID | `497d6ee9-3ec2-4a18-b82e-80ebe7f8cd80` |

This is configured in `wrangler.jsonc`. The same database is used in local development (via Wrangler's local D1 emulator) and in production.

---

## Migration Strategy

There are two independent sets of migrations that share the same D1 database.

### Better Auth migrations

Better Auth owns the authentication tables: `user`, `session`, `account`, `verification`.

The migration SQL is in `auth-migrations/0001_auth_schema.sql`. It uses `CREATE TABLE IF NOT EXISTS` throughout — it is safe to re-run.

Apply locally:

```
pnpm --filter api auth:migrate:local
```

Apply to remote (production) database:

```
pnpm --filter api auth:migrate:remote
```

If you upgrade Better Auth and the schema changes, generate new SQL using:

```js
// Run from apps/api:
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
// ... see auth-migrations/0001_auth_schema.sql for the generation approach
```

### Drizzle application migrations

Drizzle manages application-specific tables (questions, subjects, student progress, etc.).

The schema lives in `src/db/schema/`. Generated migrations go into `drizzle/`.

| Command | Purpose |
|---|---|
| `pnpm --filter api drizzle:generate` | Generate migration files from schema changes |
| `pnpm --filter api drizzle:migrate:local` | Apply to local D1 |
| `pnpm --filter api drizzle:migrate:remote` | Apply to remote D1 |

The application schema is currently empty. Tables are added when features are implemented.

---

## Better Auth Configuration

Better Auth is configured in `src/auth/auth.ts`.

- **Database**: Cloudflare D1 via native adapter (no Drizzle adapter required)
- **Authentication method**: Email and password
- **Trusted origins**: Read from `WEB_APP_URL` environment variable
- **Secure cookies**: Automatically enabled when `BETTER_AUTH_URL` starts with `https://`

Better Auth handles its own schema. Do not add auth tables to the Drizzle schema.

### Authentication tables

| Table | Purpose |
|---|---|
| `user` | User accounts |
| `session` | Active sessions |
| `account` | Provider-specific account records |
| `verification` | Email verification tokens |

---

## Drizzle ORM

Drizzle is configured in `src/db/index.ts` and `drizzle.config.ts`.

The `createDb(env.DB)` function creates a Drizzle instance per request using the D1 binding.

Usage in a route handler:

```ts
import { createDb } from "../db";

app.get("/example", async (c) => {
  const db = createDb(c.env.DB);
  // Use db here
});
```

---

## Local Development

### Prerequisites

- Node.js (LTS)
- pnpm

### Setup

```bash
# From the repository root
pnpm install

# Navigate to the API
cd apps/api

# Copy environment variables template
cp dev.vars.example .dev.vars
# Fill in .dev.vars with your actual values

# Apply Better Auth tables to local D1
pnpm auth:migrate:local

# Start the development server
pnpm dev
```

The API starts on `http://localhost:8787`.

### Starting from the monorepo root

```bash
pnpm dev
```

This starts both the web application (port 3000) and the API (port 8787) via Turborepo.

---

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | API identification and status |
| GET | `/health` | General health |
| GET | `/health/db` | D1 connectivity |
| GET | `/health/auth` | Better Auth configuration status |
| GET | `/health/ai` | Gemini configuration status |
| ALL | `/api/auth/*` | Better Auth handler |
| GET | `/api/me` | Current authenticated user (requires session) |

---

## Authentication — Client Usage

The API uses Better Auth with cookie-based sessions.

The web application communicates with the API at `http://localhost:8787` locally.

### Register

```ts
await fetch("http://localhost:8787/api/auth/sign-up/email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ name: "...", email: "...", password: "..." }),
});
```

### Sign in

```ts
await fetch("http://localhost:8787/api/auth/sign-in/email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email: "...", password: "..." }),
});
```

### Get session

```ts
const res = await fetch("http://localhost:8787/api/me", {
  credentials: "include",
});
// 200 with { user: ... } when authenticated
// 401 when no valid session
```

### Sign out

```ts
await fetch("http://localhost:8787/api/auth/sign-out", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: "{}",
});
```

**Important**: Better Auth enforces `Origin` header validation on state-changing requests (sign-up, sign-in, sign-out). Browsers send this automatically. Direct API calls must include `Origin: http://localhost:3000` (or the configured `WEB_APP_URL`).

---

## Gemini Integration

The Gemini client factory is in `src/lib/ai/gemini.ts`.

Usage in a route handler:

```ts
import { createGeminiClient, getGeminiModel } from "../lib/ai/gemini";

const client = createGeminiClient(env.GEMINI_API_KEY);
const model = getGeminiModel(client);
const result = await model.generateContent("...");
```

The default model is `gemini-1.5-flash`, configured centrally in `GEMINI_DEFAULT_MODEL`. The API key is never exposed to the browser.

The `/health/ai` endpoint only checks whether the key is configured — it does not make an external request.

---

## UploadThing Integration

The UploadThing configuration is in `src/lib/storage/uploadthing.ts`.

The `uploadRouter` is currently empty. Add upload routes as file upload features are implemented.

The integration is configured for Cloudflare Workers compatibility:
- Token passed explicitly (no `process.env`)
- `cache` stripped from fetch init (not supported in Workers)
- `handleDaemonPromise` wired to `ctx.waitUntil`

Usage in `src/index.ts` when file routes are added:

```ts
import { createUploadthingHandler } from "./lib/storage/uploadthing";

app.all("/api/uploadthing", (c) => {
  const handler = createUploadthingHandler(c.env.UPLOADTHING_TOKEN, c.executionCtx);
  return handler(c.req.raw);
});
```

---

## Deployment

### Prerequisites

- Cloudflare account with Workers and D1 enabled
- Wrangler authenticated: `wrangler login`

### Pre-deployment checklist

1. Configure production secrets via `wrangler secret put <NAME>`
2. Apply Better Auth migrations to the remote D1: `pnpm auth:migrate:remote`
3. Set correct `BETTER_AUTH_URL` to your deployed Worker URL
4. Set correct `WEB_APP_URL` to your deployed web application URL

### Deploy

```bash
pnpm --filter api deploy
# or from apps/api:
pnpm deploy
```

Do not run `auth:migrate:remote` or `drizzle:migrate:remote` without verifying the SQL first. These operations are irreversible.

---

## Known Limitations and Outstanding Actions

### Remote D1 migrations

The auth and application migrations have only been applied to the local D1 emulator. Before production use:

1. Authenticate with Cloudflare: `wrangler login`
2. Apply auth migration: `pnpm --filter api auth:migrate:remote`
3. Verify tables exist in the remote database

### Production secrets

Production environment variables must be set via Cloudflare's secret management:

```
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put UPLOADTHING_TOKEN
```

### Application schema

The Drizzle schema in `src/db/schema/` is empty. Application tables (subjects, questions, student progress, etc.) are added as features are implemented.

### UploadThing routes

The `uploadRouter` in `src/lib/storage/uploadthing.ts` has no routes defined. Upload functionality requires adding specific file routes when file upload features are built.

### Email provider

Better Auth is configured without an email provider. Email verification is not enforced. Add an email provider when user verification is required.
