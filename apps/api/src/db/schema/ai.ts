/**
 * AI Gateway database schema.
 * Uses Cloudflare D1 (SQLite) via Drizzle ORM.
 *
 * Tables:
 *   ai_credentials    - encrypted provider API credentials
 *   ai_usage_events   - per-request usage tracking
 *   ai_route_events   - routing decisions and failure events
 *
 * Important: Raw API keys are NEVER stored. Only AES-256-GCM ciphertext.
 */
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// ai_credentials
// Stores encrypted provider credentials and health metadata.
// ---------------------------------------------------------------------------
export const aiCredentials = sqliteTable(
  "ai_credentials",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull().default("gemini"),
    name: text("name").notNull(),
    // Encrypted API key (AES-256-GCM ciphertext, base64)
    encryptedKey: text("encrypted_key").notNull(),
    // Base64-encoded IV used for encryption (unique per credential)
    keyIv: text("key_iv").notNull(),
    // Encryption key version (for future key rotation)
    keyVersion: integer("key_version").notNull().default(1),
    // Masked display: "••••••••1234" — safe to show in admin UI
    maskedKey: text("masked_key").notNull(),
    // 'active' | 'disabled' | 'invalid' | 'cooldown'
    status: text("status").notNull().default("active"),
    // Unix timestamps (seconds)
    lastUsedAt: integer("last_used_at"),
    lastSuccessfulUseAt: integer("last_successful_use_at"),
    lastErrorCategory: text("last_error_category"),
    // Unix timestamp when cooldown expires
    cooldownUntil: integer("cooldown_until"),
    consecutiveFailures: integer("consecutive_failures").notNull().default(0),
    createdAt: integer("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at")
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("ai_credentials_status_idx").on(t.status),
    index("ai_credentials_last_used_idx").on(t.lastUsedAt),
    index("ai_credentials_provider_idx").on(t.provider),
  ]
);

// ---------------------------------------------------------------------------
// ai_usage_events
// Per-request usage records for monitoring and cost tracking.
// Never stores raw credentials or sensitive prompt content.
// ---------------------------------------------------------------------------
export const aiUsageEvents = sqliteTable(
  "ai_usage_events",
  {
    id: text("id").primaryKey(),
    credentialId: text("credential_id"),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    // 'text' | 'multimodal' | 'audio' | 'live' | 'streaming'
    modality: text("modality").notNull().default("text"),
    taskType: text("task_type"),
    userId: text("user_id"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    totalTokens: integer("total_tokens"),
    latencyMs: integer("latency_ms"),
    // 'success' | 'failure' | 'retry' | 'fallback'
    status: text("status").notNull(),
    errorCategory: text("error_category"),
    retryCount: integer("retry_count").notNull().default(0),
    requestId: text("request_id"),
    createdAt: integer("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("ai_usage_credential_idx").on(t.credentialId),
    index("ai_usage_created_at_idx").on(t.createdAt),
    index("ai_usage_status_idx").on(t.status),
    index("ai_usage_provider_model_idx").on(t.provider, t.model),
  ]
);

// ---------------------------------------------------------------------------
// ai_route_events
// Routing decisions, failures, and cooldown events for diagnostics.
// ---------------------------------------------------------------------------
export const aiRouteEvents = sqliteTable(
  "ai_route_events",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id").notNull(),
    credentialId: text("credential_id"),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    // 'selected' | 'failed' | 'cooldown' | 'retry' | 'circuit_break'
    eventType: text("event_type").notNull(),
    errorCategory: text("error_category"),
    cooldownSeconds: integer("cooldown_seconds"),
    createdAt: integer("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("ai_route_request_idx").on(t.requestId),
    index("ai_route_credential_idx").on(t.credentialId),
    index("ai_route_created_at_idx").on(t.createdAt),
  ]
);
