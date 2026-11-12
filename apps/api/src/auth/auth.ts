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
  /** Optional comma-separated list of additional trusted origins (e.g. preview domains). */
  CORS_ORIGINS?: string;
}

export function createAuth(env: AuthEnvironment) {
  // Build the full list of trusted origins from WEB_APP_URL and optional CORS_ORIGINS.
  const extraOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : [];
  const trustedOrigins = [
    ...(env.WEB_APP_URL ? [env.WEB_APP_URL] : []),
    ...extraOrigins,
  ];

  return betterAuth({
    // Better Auth accepts any object that satisfies its D1Database interface.
    // The Cloudflare Workers global D1Database is structurally compatible.
    database: env.DB,

    secret: env.BETTER_AUTH_SECRET,

    baseURL: env.BETTER_AUTH_URL,

    trustedOrigins,

    emailAndPassword: {
      enabled: true,
      // Email verification is not yet functional — no email provider is configured.
      // Set to false to allow registration without a verification step.
      // Update this when an email delivery service is added.
      requireEmailVerification: false,
    },

    advanced: {
      // Use secure cookies in production; plain cookies in local dev.
      useSecureCookies: env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
    },
  });
}
