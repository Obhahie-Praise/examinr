import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration for Examinr API.
 *
 * This manages application-specific schema migrations only.
 * Better Auth manages its own authentication schema separately via getMigrations().
 *
 * Migration commands:
 *   Generate migration files:  pnpm --filter api drizzle:generate
 *   Apply locally (dev D1):    pnpm --filter api drizzle:migrate:local
 *   Apply remotely (prod D1):  pnpm --filter api drizzle:migrate:remote
 *
 * The drizzle/ directory is the migration output directory.
 * This path is also referenced in wrangler.jsonc as migrations_dir.
 */
export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/db/schema/**/*.ts",
  out: "./drizzle",
  dbCredentials: {
    // These are only used when running migrations remotely via drizzle-kit push.
    // For local development, use `wrangler d1 migrations apply` instead.
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? "",
    token: process.env.CLOUDFLARE_API_TOKEN ?? "",
  },
});
