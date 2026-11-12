/**
 * Credential Router
 *
 * Selects eligible credentials using LRU (least-recently-used) strategy.
 * All routing state lives in D1 — no in-memory global state.
 *
 * IMPORTANT: Multiple credentials from the same Google Cloud project share
 * project-level quota. The router does NOT assume each credential = independent
 * quota. It tracks observed quota failures across the pool and stops cycling
 * conservatively when shared-quota exhaustion is likely.
 *
 * The router never claims strict round-robin behaviour, since Cloudflare Worker
 * isolates may execute independently and cannot guarantee global ordering.
 */
import type { Db } from "../../../db";
import { CredentialManager } from "./credential-manager";
import { AllCredentialsUnavailableError } from "./errors";
import type { AiErrorCategory } from "./types";

export interface RouteDecision {
  credentialId: string;
  decryptedKey: string;
  provider: string;
}

export interface RetryContext {
  /** Credential IDs that have already failed this request */
  excludeCredentialIds: string[];
  /** Number of attempts made so far (0 = first attempt) */
  attemptNumber: number;
  /** Quota/rate-limit failures in a row across different credentials */
  consecutiveQuotaFailures: number;
}

/** Maximum total attempts per request (including initial attempt) */
const MAX_ATTEMPTS = 3;

/**
 * Stop cycling through credentials after this many consecutive quota failures.
 * This detects likely shared-project quota exhaustion.
 *
 * Example: if 2 out of 3 credentials all return 429, they likely share quota.
 * Adding a 3rd attempt is unlikely to help and wastes quota budget.
 */
const MAX_CONSECUTIVE_QUOTA_FAILURES = 2;

export class CredentialRouter {
  constructor(
    private readonly credentialManager: CredentialManager,
    private readonly db: Db
  ) {}

  /**
   * Select the best eligible credential for a request.
   *
   * Strategy: LRU (least-recently-used) from D1.
   * This distributes load without requiring global coordination.
   *
   * Throws AllCredentialsUnavailableError if no eligible credential exists.
   */
  async selectCredential(
    provider: string = "gemini",
    retryCtx: RetryContext = {
      excludeCredentialIds: [],
      attemptNumber: 0,
      consecutiveQuotaFailures: 0,
    }
  ): Promise<RouteDecision> {
    // Conservative quota exhaustion detection
    if (retryCtx.consecutiveQuotaFailures >= MAX_CONSECUTIVE_QUOTA_FAILURES) {
      throw new AllCredentialsUnavailableError();
    }

    if (retryCtx.attemptNumber >= MAX_ATTEMPTS) {
      throw new AllCredentialsUnavailableError();
    }

    const eligible = await this.credentialManager.getEligibleCredentials(provider);

    const candidates = eligible.filter(
      (c) => !retryCtx.excludeCredentialIds.includes(c.id)
    );

    if (candidates.length === 0) {
      throw new AllCredentialsUnavailableError();
    }

    // getEligibleCredentials already orders by lastUsedAt ASC (nulls first)
    // So candidates[0] is the least recently used eligible credential
    const selected = candidates[0];

    // Decrypt the key — only done here, used for this request only
    const decryptedKey = await this.credentialManager.getDecryptedKey(selected.id);

    return {
      credentialId: selected.id,
      decryptedKey,
      provider: selected.provider,
    };
  }

  /**
   * Build a new retry context after a credential failure.
   * Tracks which credentials to exclude and monitors quota failure patterns.
   */
  buildRetryContext(
    previous: RetryContext,
    failedCredentialId: string,
    errorCategory: AiErrorCategory
  ): RetryContext {
    const isQuotaError =
      errorCategory === "quota_exceeded" || errorCategory === "rate_limit";

    return {
      excludeCredentialIds: [
        ...previous.excludeCredentialIds,
        failedCredentialId,
      ],
      attemptNumber: previous.attemptNumber + 1,
      consecutiveQuotaFailures: isQuotaError
        ? previous.consecutiveQuotaFailures + 1
        : 0,
    };
  }

  /** Create a fresh retry context for a new request */
  initialContext(): RetryContext {
    return {
      excludeCredentialIds: [],
      attemptNumber: 0,
      consecutiveQuotaFailures: 0,
    };
  }
}
