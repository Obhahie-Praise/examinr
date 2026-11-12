import { Hono } from "hono";
import { cors } from "hono/cors";

import { createAuth, type AuthEnvironment } from "./auth/auth";
import { health } from "./routes/health";
import { me } from "./routes/me";
import { aiCredentialsRouter } from "./routes/ai-credentials";

/**
 * Full set of environment bindings available to this Worker.
 * DB is the Cloudflare D1 binding (binding name must match wrangler.jsonc).
 */
type Bindings = AuthEnvironment & {
  /** Comma-separated list of additional allowed origins beyond WEB_APP_URL. */
  CORS_ORIGINS?: string;
  GEMINI_API_KEY?: string;
  UPLOADTHING_TOKEN?: string;
  AI_CREDENTIAL_ENCRYPTION_KEY: string;
  SUPER_ADMIN_EMAILS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ---------------------------------------------------------------------------
// CORS
// Allow the web application to make credentialed requests to the API.
// WEB_APP_URL is the primary allowed origin; CORS_ORIGINS can extend the list
// (e.g. preview deployments, admin tools on different domains).
// Both are read at request time so they reflect the runtime environment.
// ---------------------------------------------------------------------------
app.use("/api/*", async (c, next) => {
  const webAppUrl = c.env.WEB_APP_URL ?? "http://localhost:3000";
  const extraOrigins = c.env.CORS_ORIGINS
    ? c.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : [];
  const allowedOrigins = [webAppUrl, ...extraOrigins];

  const corsMiddleware = cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
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
// AI Gateway — super-admin credential management
// All routes enforce server-side super-admin authorization.
// ---------------------------------------------------------------------------
app.route("/api/admin/ai/credentials", aiCredentialsRouter);

export default app;
