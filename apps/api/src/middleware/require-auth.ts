/**
 * Authentication middleware for protected Hono routes.
 *
 * Validates the Better Auth session on every request and returns 401
 * if no valid session is present. The session is attached to the context
 * via c.set() so downstream handlers can read it without re-validating.
 *
 * Usage:
 *   const protected = new Hono<{ Bindings: AuthEnvironment; Variables: AuthVariables }>();
 *   protected.use("*", requireAuth);
 *   protected.get("/", (c) => {
 *     const session = c.get("session");
 *     return c.json({ user: session.user });
 *   });
 */
import type { Context, Next } from "hono";
import { createAuth, type AuthEnvironment } from "../auth/auth";

/**
 * The Hono Variables shape required when using requireAuth.
 * Add this to your Hono instance's generic parameter.
 */
export interface AuthVariables {
  session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
}

/**
 * Hono middleware that enforces authentication.
 * Returns 401 if the session is missing or invalid.
 */
export async function requireAuth(
  c: Context<{ Bindings: AuthEnvironment }>,
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

  // Make the session available to downstream handlers without re-fetching.
  // Cast through unknown because Hono's c.set() requires the Variables type to
  // be declared on the Hono instance — callers must include AuthVariables.
  (c as unknown as Context<{ Bindings: AuthEnvironment; Variables: AuthVariables }>)
    .set("session", session);

  return next();
}
