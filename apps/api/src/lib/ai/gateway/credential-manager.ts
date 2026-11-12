/**
 * Credential Manager
 *
 * Handles CRUD operations and health tracking for AI provider credentials.
 * All routing state (health, last-used, cooldowns) lives in D1 so it
 * persists across Worker isolate restarts (Cloudflare Workers are stateless).
 *
 * Decrypted API keys are only exposed within getDecryptedKey() — they are
 * never stored in memory outside the duration of a single request,
 * never returned from any public API, and never logged.
 */
import { eq, ne, and, desc } from "drizzle-orm";
import type { Db } from "../../../db";
import { aiCredentials } from "../../../db/schema/ai";
import { encrypt, decrypt, maskApiKey } from "./encryption";
import type { AiErrorCategory, CredentialRecord, SafeCredential } from "./types";

function generateId(): string {
  return crypto.randomUUID();
}

/** Convert a D1 integer timestamp (unix seconds) to a Date */
function unixToDate(val: number | null | undefined): Date | null {
  if (val === null || val === undefined) return null;
  return new Date(val * 1000);
}

/** Convert a Date to unix epoch seconds for D1 storage */
function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function rowToRecord(r: typeof aiCredentials.$inferSelect): CredentialRecord {
  return {
    id: r.id,
    provider: r.provider,
    name: r.name,
    encryptedKey: r.encryptedKey,
    keyIv: r.keyIv,
    keyVersion: r.keyVersion,
    maskedKey: r.maskedKey,
    status: r.status as CredentialRecord["status"],
    lastErrorCategory: r.lastErrorCategory as AiErrorCategory | null,
    lastUsedAt: unixToDate(r.lastUsedAt),
    lastSuccessfulUseAt: unixToDate(r.lastSuccessfulUseAt),
    cooldownUntil: unixToDate(r.cooldownUntil),
    consecutiveFailures: r.consecutiveFailures,
    createdAt: unixToDate(r.createdAt) ?? new Date(),
    updatedAt: unixToDate(r.updatedAt) ?? new Date(),
  };
}

function recordToSafe(record: CredentialRecord): SafeCredential {
  return {
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
  };
}

export class CredentialManager {
  constructor(
    private readonly db: Db,
    private readonly encryptionKey: string
  ) {}

  /**
   * Add a new credential.
   * The API key is encrypted immediately — the plaintext is never persisted.
   */
  async add(
    name: string,
    apiKey: string,
    provider: string = "gemini"
  ): Promise<SafeCredential> {
    const encrypted = await encrypt(apiKey, this.encryptionKey);
    const masked = maskApiKey(apiKey);
    const id = generateId();
    const now = dateToUnix(new Date());

    await this.db.insert(aiCredentials).values({
      id,
      provider,
      name,
      encryptedKey: encrypted.ciphertext,
      keyIv: encrypted.iv,
      keyVersion: encrypted.version,
      maskedKey: masked,
      status: "active",
      consecutiveFailures: 0,
      createdAt: now,
      updatedAt: now,
    });

    const record = await this.getRecordById(id);
    if (!record) throw new Error("Failed to retrieve newly created credential");
    return recordToSafe(record);
  }

  async list(provider?: string): Promise<SafeCredential[]> {
    const rows = provider
      ? await this.db
          .select()
          .from(aiCredentials)
          .where(eq(aiCredentials.provider, provider))
          .orderBy(desc(aiCredentials.createdAt))
      : await this.db
          .select()
          .from(aiCredentials)
          .orderBy(desc(aiCredentials.createdAt));

    return rows.map((r) => recordToSafe(rowToRecord(r)));
  }

  async getById(id: string): Promise<CredentialRecord | null> {
    return this.getRecordById(id);
  }

  private async getRecordById(id: string): Promise<CredentialRecord | null> {
    const rows = await this.db
      .select()
      .from(aiCredentials)
      .where(eq(aiCredentials.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return rowToRecord(rows[0]);
  }

  /**
   * Decrypt and return a credential's API key.
   *
   * This is the ONLY place where decryption occurs.
   * The returned key must only be used for the current request and never stored.
   * Never log the return value. Never include it in API responses.
   */
  async getDecryptedKey(id: string): Promise<string> {
    const rows = await this.db
      .select({
        encryptedKey: aiCredentials.encryptedKey,
        keyIv: aiCredentials.keyIv,
        keyVersion: aiCredentials.keyVersion,
      })
      .from(aiCredentials)
      .where(eq(aiCredentials.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new Error(`Credential ${id} not found`);
    }

    const { encryptedKey, keyIv, keyVersion } = rows[0];
    return decrypt(
      { ciphertext: encryptedKey, iv: keyIv, version: keyVersion },
      this.encryptionKey
    );
  }

  async rename(id: string, name: string): Promise<SafeCredential> {
    await this.db
      .update(aiCredentials)
      .set({ name, updatedAt: dateToUnix(new Date()) })
      .where(eq(aiCredentials.id, id));

    const record = await this.getRecordById(id);
    if (!record) throw new Error(`Credential ${id} not found`);
    return recordToSafe(record);
  }

  async enable(id: string): Promise<SafeCredential> {
    await this.db
      .update(aiCredentials)
      .set({
        status: "active",
        consecutiveFailures: 0,
        cooldownUntil: null,
        lastErrorCategory: null,
        updatedAt: dateToUnix(new Date()),
      })
      .where(eq(aiCredentials.id, id));

    const record = await this.getRecordById(id);
    if (!record) throw new Error(`Credential ${id} not found`);
    return recordToSafe(record);
  }

  async disable(id: string): Promise<SafeCredential> {
    await this.db
      .update(aiCredentials)
      .set({
        status: "disabled",
        updatedAt: dateToUnix(new Date()),
      })
      .where(eq(aiCredentials.id, id));

    const record = await this.getRecordById(id);
    if (!record) throw new Error(`Credential ${id} not found`);
    return recordToSafe(record);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(aiCredentials)
      .where(eq(aiCredentials.id, id));
  }

  /**
   * Record a successful use.
   * Resets consecutive failures and clears any cooldown.
   */
  async recordSuccess(id: string): Promise<void> {
    const now = dateToUnix(new Date());
    await this.db
      .update(aiCredentials)
      .set({
        lastUsedAt: now,
        lastSuccessfulUseAt: now,
        consecutiveFailures: 0,
        status: "active",
        lastErrorCategory: null,
        cooldownUntil: null,
        updatedAt: now,
      })
      .where(eq(aiCredentials.id, id));
  }

  /**
   * Record a failure.
   * Increments consecutive failures and applies appropriate status changes.
   * Invalid/auth failures disable the credential permanently.
   * Rate limit/quota failures apply a cooldown.
   */
  async recordFailure(
    id: string,
    errorCategory: AiErrorCategory,
    cooldownSeconds?: number
  ): Promise<void> {
    const record = await this.getRecordById(id);
    if (!record) return;

    const newFailures = record.consecutiveFailures + 1;
    const now = new Date();

    let newStatus: CredentialRecord["status"] = record.status;
    let cooldownUntil: number | null = null;

    if (
      errorCategory === "invalid_credential" ||
      errorCategory === "auth_failure"
    ) {
      // Confirmed bad key — mark invalid, requires admin intervention
      newStatus = "invalid";
    } else if (cooldownSeconds && cooldownSeconds > 0) {
      newStatus = "cooldown";
      cooldownUntil = dateToUnix(
        new Date(now.getTime() + cooldownSeconds * 1000)
      );
    } else if (newFailures >= 5 && record.status === "active") {
      // Conservative auto-cooldown after 5 consecutive failures
      newStatus = "cooldown";
      cooldownUntil = dateToUnix(new Date(now.getTime() + 60 * 1000));
    }

    await this.db
      .update(aiCredentials)
      .set({
        lastUsedAt: dateToUnix(now),
        consecutiveFailures: newFailures,
        lastErrorCategory: errorCategory,
        status: newStatus,
        cooldownUntil,
        updatedAt: dateToUnix(now),
      })
      .where(eq(aiCredentials.id, id));
  }

  /**
   * Get credentials eligible for routing.
   * Excludes disabled and confirmed-invalid credentials.
   * Expired cooldowns are filtered in application code (D1 datetime comparison is limited).
   * Returns in LRU order (least recently used first, nulls first).
   */
  async getEligibleCredentials(
    provider: string = "gemini"
  ): Promise<CredentialRecord[]> {
    const now = new Date();

    const rows = await this.db
      .select()
      .from(aiCredentials)
      .where(
        and(
          eq(aiCredentials.provider, provider),
          ne(aiCredentials.status, "disabled"),
          ne(aiCredentials.status, "invalid")
        )
      )
      .orderBy(aiCredentials.lastUsedAt); // NULL first = least recently used

    return rows
      .map(rowToRecord)
      .filter((r) => {
        if (r.status === "cooldown" && r.cooldownUntil !== null) {
          return r.cooldownUntil <= now; // include if cooldown has expired
        }
        return true;
      });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    disabled: number;
    invalid: number;
    cooldown: number;
  }> {
    const rows = await this.db
      .select({ status: aiCredentials.status, cooldownUntil: aiCredentials.cooldownUntil })
      .from(aiCredentials);

    const now = Date.now();
    const stats = { total: rows.length, active: 0, disabled: 0, invalid: 0, cooldown: 0 };

    for (const r of rows) {
      switch (r.status) {
        case "active":
          stats.active++;
          break;
        case "disabled":
          stats.disabled++;
          break;
        case "invalid":
          stats.invalid++;
          break;
        case "cooldown": {
          // Only count as cooldown if still active
          const expiry = r.cooldownUntil ? r.cooldownUntil * 1000 : 0;
          if (expiry > now) {
            stats.cooldown++;
          } else {
            stats.active++; // expired cooldown = effectively active
          }
          break;
        }
      }
    }

    return stats;
  }
}
