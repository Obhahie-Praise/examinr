/**
 * Usage and Monitoring Manager
 *
 * Records AI request events for operational visibility and cost tracking.
 * Never stores raw credentials or sensitive prompt/response content.
 * Failures in recording must never break the primary AI request.
 */
import type { Db } from "../../../db";
import { aiUsageEvents, aiRouteEvents } from "../../../db/schema/ai";
import { eq, desc } from "drizzle-orm";

function generateId(): string {
  return crypto.randomUUID();
}

function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export interface UsageEventInput {
  credentialId?: string;
  provider: string;
  model: string;
  modality?: string;
  taskType?: string;
  userId?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
  status: "success" | "failure" | "retry" | "fallback";
  errorCategory?: string;
  retryCount?: number;
  requestId?: string;
}

export interface RouteEventInput {
  requestId: string;
  credentialId?: string;
  provider: string;
  model: string;
  eventType: "selected" | "failed" | "cooldown" | "retry" | "circuit_break";
  errorCategory?: string;
  cooldownSeconds?: number;
}

export class UsageManager {
  constructor(private readonly db: Db) {}

  /**
   * Record a usage event for a completed AI request.
   * Silently swallows recording errors — usage tracking must not block AI requests.
   */
  async recordUsage(input: UsageEventInput): Promise<void> {
    try {
      const now = dateToUnix(new Date());
      await this.db.insert(aiUsageEvents).values({
        id: generateId(),
        credentialId: input.credentialId ?? null,
        provider: input.provider,
        model: input.model,
        modality: input.modality ?? "text",
        taskType: input.taskType ?? null,
        userId: input.userId ?? null,
        inputTokens: input.inputTokens ?? null,
        outputTokens: input.outputTokens ?? null,
        totalTokens: input.totalTokens ?? null,
        latencyMs: input.latencyMs ?? null,
        status: input.status,
        errorCategory: input.errorCategory ?? null,
        retryCount: input.retryCount ?? 0,
        requestId: input.requestId ?? null,
        createdAt: now,
      });
    } catch {
      // Intentionally swallowed — do not break AI requests
    }
  }

  /**
   * Record a routing decision event for diagnostics.
   * Silently swallows recording errors.
   */
  async recordRouteEvent(input: RouteEventInput): Promise<void> {
    try {
      const now = dateToUnix(new Date());
      await this.db.insert(aiRouteEvents).values({
        id: generateId(),
        requestId: input.requestId,
        credentialId: input.credentialId ?? null,
        provider: input.provider,
        model: input.model,
        eventType: input.eventType,
        errorCategory: input.errorCategory ?? null,
        cooldownSeconds: input.cooldownSeconds ?? null,
        createdAt: now,
      });
    } catch {
      // Intentionally swallowed
    }
  }

  /**
   * Get aggregate usage statistics.
   */
  async getStats(): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    recentSuccessRate: number;
  }> {
    const rows = await this.db
      .select({ status: aiUsageEvents.status })
      .from(aiUsageEvents);

    const total = rows.length;
    const successful = rows.filter((r) => r.status === "success").length;
    const failed = rows.filter((r) => r.status === "failure").length;

    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      recentSuccessRate:
        total > 0 ? Math.round((successful / total) * 100) : 100,
    };
  }

  /**
   * Get recent usage events (most recent first).
   */
  async getRecentEvents(limit: number = 50): Promise<
    Array<{
      id: string;
      provider: string;
      model: string;
      modality: string;
      status: string;
      errorCategory: string | null;
      latencyMs: number | null;
      retryCount: number;
      createdAt: number;
    }>
  > {
    const rows = await this.db
      .select({
        id: aiUsageEvents.id,
        provider: aiUsageEvents.provider,
        model: aiUsageEvents.model,
        modality: aiUsageEvents.modality,
        status: aiUsageEvents.status,
        errorCategory: aiUsageEvents.errorCategory,
        latencyMs: aiUsageEvents.latencyMs,
        retryCount: aiUsageEvents.retryCount,
        createdAt: aiUsageEvents.createdAt,
      })
      .from(aiUsageEvents)
      .orderBy(desc(aiUsageEvents.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt ?? 0,
    }));
  }
}
