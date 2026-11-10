import { betterAuth } from "better-auth";

/**
 * The environment bindings required by Better Auth.
 * DB is the Cloudflare D1 binding (global D1Database type).
 */
export interface AuthEnvironment {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  WEB_APP_URL: string;
}

export function createAuth(env: AuthEnvironment) {
  return betterAuth({
    // Better Auth accepts any object that satisfies its D1Database interface.
    // The Cloudflare Workers global D1Database is structurally compatible.
    database: env.DB,

    secret: env.BETTER_AUTH_SECRET,

    baseURL: env.BETTER_AUTH_URL,

    trustedOrigins: env.WEB_APP_URL ? [env.WEB_APP_URL] : [],

    emailAndPassword: {
      enabled: true,
    },

    advanced: {
      // Use secure cookies in production; plain cookies in local dev.
      useSecureCookies: env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
    },
  });
}
