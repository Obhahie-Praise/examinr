/**
 * AI Credential Management Routes
 * Super-admin only endpoints for managing AI provider credentials.
 *
 * All endpoints enforce super-admin authorization server-side.
 * Raw credentials are NEVER returned in any response.
 *
 * Endpoints:
 *   GET    /api/admin/ai/credentials            - List all credentials
 *   POST   /api/admin/ai/credentials            - Add a credential
 *   GET    /api/admin/ai/credentials/:id        - Get one credential
 *   PATCH  /api/admin/ai/credentials/:id/name   - Rename
 *   POST   /api/admin/ai/credentials/:id/enable - Enable
 *   POST   /api/admin/ai/credentials/:id/disable - Disable
 *   POST   /api/admin/ai/credentials/:id/test   - Test validity
 *   DELETE /api/admin/ai/credentials/:id        - Delete
 *   GET    /api/admin/ai/stats                  - Usage and health overview
 */
import { Hono } from "hono";
import { createDb } from "../db";
import { createAiGateway } from "../lib/ai/gateway";
import {
  requireSuperAdmin,
  type AdminEnvironment,
} from "../lib/ai/gateway/auth-middleware";
import {
  addCredentialSchema,
  updateCredentialNameSchema,
} from "../lib/ai/gateway/types";

const aiCredentialsRouter = new Hono<{ Bindings: AdminEnvironment }>();

// All routes enforce super-admin access
aiCredentialsRouter.use("*", requireSuperAdmin);

// ---------------------------------------------------------------------------
// GET /api/admin/ai/credentials
// ---------------------------------------------------------------------------
aiCredentialsRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const [credentials, stats] = await Promise.all([
    gateway.credentials.list(),
    gateway.credentials.getStats(),
  ]);

  return c.json({ credentials, stats });
});

// ---------------------------------------------------------------------------
// POST /api/admin/ai/credentials
// ---------------------------------------------------------------------------
aiCredentialsRouter.post("/", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = addCredentialSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", issues: parsed.error.issues },
      400
    );
  }

  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const credential = await gateway.credentials.add(
    parsed.data.name,
    parsed.data.apiKey,
    parsed.data.provider
  );

  return c.json({ credential }, 201);
});

// ---------------------------------------------------------------------------
// GET /api/admin/ai/credentials/:id
// ---------------------------------------------------------------------------
aiCredentialsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const record = await gateway.credentials.getById(id);
  if (!record) return c.json({ error: "Credential not found" }, 404);

  return c.json({
    credential: {
      id: record.id,
      provider: record.provider,
      name: record.name,
      maskedKey: record.maskedKey,
      status: record.status,
      lastUsedAt: record.lastUsedAt?.toISOString() ?? null,
      lastSuccessfulUseAt: record.lastSuccessfulUseAt?.toISOString() ?? null,
      lastErrorCategory: record.lastErrorCategory,
      cooldownUntil: record.cooldownUntil?.toISOString() ?? null,
      consecutiveFailures: record.consecutiveFailures,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    },
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/ai/credentials/:id/name
// ---------------------------------------------------------------------------
aiCredentialsRouter.patch("/:id/name", async (c) => {
  const id = c.req.param("id");

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = updateCredentialNameSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", issues: parsed.error.issues },
      400
    );
  }

  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const record = await gateway.credentials.getById(id);
  if (!record) return c.json({ error: "Credential not found" }, 404);

  const updated = await gateway.credentials.rename(id, parsed.data.name);
  return c.json({ credential: updated });
});

// ---------------------------------------------------------------------------
// POST /api/admin/ai/credentials/:id/enable
// ---------------------------------------------------------------------------
aiCredentialsRouter.post("/:id/enable", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const record = await gateway.credentials.getById(id);
  if (!record) return c.json({ error: "Credential not found" }, 404);

  const updated = await gateway.credentials.enable(id);
  return c.json({ credential: updated });
});

// ---------------------------------------------------------------------------
// POST /api/admin/ai/credentials/:id/disable
// ---------------------------------------------------------------------------
aiCredentialsRouter.post("/:id/disable", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const record = await gateway.credentials.getById(id);
  if (!record) return c.json({ error: "Credential not found" }, 404);

  const updated = await gateway.credentials.disable(id);
  return c.json({ credential: updated });
});

// ---------------------------------------------------------------------------
// POST /api/admin/ai/credentials/:id/test
// ---------------------------------------------------------------------------
aiCredentialsRouter.post("/:id/test", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const record = await gateway.credentials.getById(id);
  if (!record) return c.json({ error: "Credential not found" }, 404);

  if (record.status === "disabled") {
    return c.json({ error: "Cannot test a disabled credential" }, 400);
  }

  const result = await gateway.testCredential(id);
  return c.json(result);
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/ai/credentials/:id
// ---------------------------------------------------------------------------
aiCredentialsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const record = await gateway.credentials.getById(id);
  if (!record) return c.json({ error: "Credential not found" }, 404);

  await gateway.credentials.delete(id);
  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// GET /api/admin/ai/stats
// ---------------------------------------------------------------------------
aiCredentialsRouter.get("/stats/overview", async (c) => {
  const db = createDb(c.env.DB);
  const gateway = createAiGateway(db, c.env.AI_CREDENTIAL_ENCRYPTION_KEY);

  const [credentialStats, usageStats, recentEvents] = await Promise.all([
    gateway.credentials.getStats(),
    gateway.usage.getStats(),
    gateway.usage.getRecentEvents(20),
  ]);

  return c.json({
    credentials: credentialStats,
    usage: usageStats,
    recentEvents,
  });
});

export { aiCredentialsRouter };
