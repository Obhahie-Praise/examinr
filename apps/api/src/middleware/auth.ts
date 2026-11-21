import { createMiddleware } from "hono/factory";
import { createAuth } from "../lib/auth";

export const requireAuth = createMiddleware(
  async (c, next) => {
    const auth = createAuth(c.env);

    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json(
        { message: "Please log in first" },
        401
      );
    }

    c.set("user", session.user);

    await next();
  }
);