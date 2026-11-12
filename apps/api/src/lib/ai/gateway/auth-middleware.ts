/**
 * Super-admin authorization middleware for Hono.
 *
 * Since Better Auth does not yet have a roles plugin configured, super-admin
 * identity is determined by matching the authenticated user's email against
 * the SUPER_ADMIN_EMAILS Worker secret.
 *
 * SUPER_ADMIN_EMAILS: comma-separated email addresses
 * Example: "admin@examinr.app,backup@examinr.app"
 *
 * Configuration:
 *   wrangler secret put SUPER_ADMIN_EMAILS
 *
 * This check is enforced server-side. Hiding the dashboard page is not
 * sufficient — the API must reject unauthorized requests independently.
 */
import type { Context, Next } from "hono";
import { createAuth } from "../../../auth/auth";

export interface AdminEnvironment {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  WEB_APP_URL: string;
  SUPER_ADMIN_EMAILS?: string;
  AI_CREDENTIAL_ENCRYPTION_KEY: string;
}

/**
 * Parse SUPER_ADMIN_EMAILS into a Set of lowercased email addresses.
 */
function getSuperAdminEmailSet(env: AdminEnvironment): Set<string> {
  const raw = env.SUPER_ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0)
  );
}

/**
 * Hono middleware that enforces super-admin access.
 * Returns 401 if not authenticated, 403 if not a super-admin.
 */
export async function requireSuperAdmin(
  c: Context<{ Bindings: AdminEnvironment }>,
  next: Next
): Promise<Response | void> {
  const auth = createAuth(c.env);

  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
  try {
    session = await auth.api.getSession({ headers: c.req.raw.headers });
  } catch {
    return c.json({ error: "Authentication required" }, 401);
  }

  if (!session) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const adminEmails = getSuperAdminEmailSet(c.env);

  if (adminEmails.size === 0) {
    // Super-admin is not configured — block access rather than allow everyone
    return c.json(
      {
        error:
          "Super-admin access is not configured. Set the SUPER_ADMIN_EMAILS Worker secret.",
      },
      503
    );
  }

  if (!adminEmails.has(session.user.email.toLowerCase())) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return next();
}
