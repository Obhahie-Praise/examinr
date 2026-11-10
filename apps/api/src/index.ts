import { Hono } from "hono";
import { cors } from "hono/cors";

import { createAuth, type AuthEnvironment } from "./auth/auth";
import { health } from "./routes/health";
import { me } from "./routes/me";
import { notionProgress, type NotionProgressBindings } from "./routes/notion-progress";

/**
 * Full set of environment bindings available to this Worker.
 * DB is the Cloudflare D1 binding (binding name must match wrangler.jsonc).
 */
type Bindings = AuthEnvironment &
  NotionProgressBindings & {
    GEMINI_API_KEY?: string;
    UPLOADTHING_TOKEN?: string;
  };

const app = new Hono<{ Bindings: Bindings }>();

// ---------------------------------------------------------------------------
// CORS
// Allow the web application to make credentialed requests to the API.
// WEB_APP_URL is read at request time so it reflects the runtime environment.
// ---------------------------------------------------------------------------
app.use("/api/*", async (c, next) => {
  const webAppUrl = c.env.WEB_APP_URL ?? "http://localhost:3000";

  const corsMiddleware = cors({
    origin: webAppUrl,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

// ---------------------------------------------------------------------------
// Root — API identification and status
// ---------------------------------------------------------------------------
app.get("/", (c) => {
  return c.json({
    name: "Examinr API",
    status: "running",
    version: "1",
  });
});

// ---------------------------------------------------------------------------
// Health routes — /health, /health/db, /health/auth, /health/ai
// ---------------------------------------------------------------------------
app.route("/health", health);

// ---------------------------------------------------------------------------
// Authentication routes — /api/auth/*
// All requests are delegated to the Better Auth handler.
// ---------------------------------------------------------------------------
app.all("/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// ---------------------------------------------------------------------------
// Protected routes
// ---------------------------------------------------------------------------
app.route("/api/me", me);

// ---------------------------------------------------------------------------
// Server-to-server integrations
// ---------------------------------------------------------------------------
app.route("/api/integrations/notion/progress", notionProgress);

export default app;
