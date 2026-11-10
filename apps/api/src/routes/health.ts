import { Hono } from "hono";
import { sql } from "drizzle-orm";

import type { AuthEnvironment } from "../auth/auth";
import { createDb } from "../db";
import { getGeminiConfigStatus } from "../lib/ai/gemini";
import { getUploadthingConfigStatus } from "../lib/storage/uploadthing";

type HealthBindings = AuthEnvironment & {
  GEMINI_API_KEY?: string;
  UPLOADTHING_TOKEN?: string;
};

const health = new Hono<{ Bindings: HealthBindings }>();

/**
 * GET /health
 * General API health — confirms the Worker process is running.
 */
health.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "Examinr API",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/db
 * D1 connectivity check — runs a minimal query against the D1 binding.
 * Returns 503 if the database is unreachable.
 */
health.get("/db", async (c) => {
  try {
    const db = createDb(c.env.DB);
    await db.run(sql`SELECT 1`);

    return c.json({
      status: "ok",
      database: "D1",
      orm: "Drizzle",
    });
  } catch (err) {
    return c.json(
      {
        status: "error",
        database: "D1",
        message: "Database connectivity check failed",
      },
      503,
    );
  }
});

/**
 * GET /health/auth
 * Authentication configuration status — confirms Better Auth is initialized
 * and its required environment variables are set. Does not expose secret values.
 */
health.get("/auth", (c) => {
  const hasSecret = Boolean(c.env.BETTER_AUTH_SECRET);
  const hasUrl = Boolean(c.env.BETTER_AUTH_URL);
  const hasWebApp = Boolean(c.env.WEB_APP_URL);
  const configured = hasSecret && hasUrl && hasWebApp;

  return c.json(
    {
      status: configured ? "ok" : "misconfigured",
      provider: "Better Auth",
      checks: {
        secret: hasSecret ? "set" : "missing",
        baseUrl: hasUrl ? "set" : "missing",
        webAppUrl: hasWebApp ? "set" : "missing",
      },
    },
    configured ? 200 : 503,
  );
});

/**
 * GET /health/ai
 * Gemini integration status — confirms the API key is set.
 * Does NOT make an external request or consume any API credits.
 */
health.get("/ai", (c) => {
  const status = getGeminiConfigStatus(c.env.GEMINI_API_KEY);

  return c.json(
    {
      status: status.configured ? "ok" : "misconfigured",
      provider: "Google Gemini",
      model: status.model,
      checks: {
        apiKey: status.configured ? "set" : "missing",
      },
      note: "This endpoint only checks configuration. No external request is made.",
    },
    status.configured ? 200 : 503,
  );
});

export { health };
