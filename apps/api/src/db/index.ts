import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

/**
 * Creates a Drizzle ORM instance bound to the provided D1 database.
 * Call this per-request using the Cloudflare environment binding (env.DB).
 *
 * The D1Database type here is the Cloudflare Workers global type, available
 * at runtime via the Worker environment.
 */
export function createDb(database: D1Database) {
  return drizzle(database, { schema });
}

export type Db = ReturnType<typeof createDb>;
