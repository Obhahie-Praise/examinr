import { createUploadthing, createRouteHandler } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";

export type { FileRouter };

const f = createUploadthing();

/**
 * Examinr file router.
 * Add upload routes here as file upload features are implemented.
 *
 * Each route should validate authentication and enforce size/type limits.
 * The UPLOADTHING_TOKEN environment variable must be set at runtime.
 */
export const uploadRouter = {
  // Placeholder — add specific routes when file upload features are built.
  // Example:
  // profileImage: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
  //   .middleware(({ req }) => { ... validate session ... })
  //   .onUploadComplete(({ metadata, file }) => { ... }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

/**
 * Creates the UploadThing route handler configured for Cloudflare Workers.
 *
 * Cloudflare Workers have no process.env, so the token and other options must
 * be passed explicitly. The `fetch` wrapper strips the unsupported `cache`
 * property from request init.
 *
 * Usage in Hono app:
 *   const utHandler = createUploadthingHandler(env.UPLOADTHING_TOKEN, ctx);
 *   app.all("/api/uploadthing", (c) => utHandler(c.req.raw));
 */
export function createUploadthingHandler(
  token: string,
  executionCtx: ExecutionContext,
) {
  return createRouteHandler({
    router: uploadRouter,
    config: {
      token,
      // Cloudflare Workers don't support the `cache` field on fetch init.
      fetch: (url, init) => {
        if (init && "cache" in init) {
          const { cache: _cache, ...rest } = init as RequestInit & {
            cache?: unknown;
          };
          return fetch(url, rest);
        }
        return fetch(url, init);
      },
      // Prevent the worker from exiting before UploadThing dev-server promises resolve.
      handleDaemonPromise: (promise) => executionCtx.waitUntil(promise),
    },
  });
}

/**
 * Returns a configuration status for health checks.
 * Does NOT make any real API requests.
 */
export function getUploadthingConfigStatus(token: string | undefined): {
  configured: boolean;
} {
  return {
    configured: Boolean(token && token.length > 0),
  };
}
