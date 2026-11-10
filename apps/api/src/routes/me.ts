import { Hono } from "hono";

import type { AuthEnvironment } from "../auth/auth";
import { createAuth } from "../auth/auth";

const me = new Hono<{ Bindings: AuthEnvironment }>();

/**
 * GET /api/me
 * Returns the currently authenticated user from the Better Auth session.
 * Returns 401 if no valid session exists.
 */
me.get("/", async (c) => {
  try {
    const auth = createAuth(c.env);

    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ user: session.user });
  } catch {
    // Session retrieval failure (e.g. malformed token) should return 401,
    // not an unhandled 500.
    return c.json({ error: "Unauthorized" }, 401);
  }
});

export { me };
