/**
 * Error types and Gemini error classification for the AI Gateway.
 *
 * Key design decisions:
 * - Not every HTTP 403 is an invalid API key (can be billing, permissions, etc.)
 * - Quota errors trigger cooldowns, not permanent disabling
 * - Only confirmed auth/key failures disable credentials permanently
 */
import type { AiErrorCategory } from "./types";

export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly category: AiErrorCategory,
    public readonly retryable: boolean = false,
    public readonly httpStatus: number = 500
  ) {
    super(message);
    this.name = "GatewayError";
  }
}

export class AllCredentialsUnavailableError extends GatewayError {
  constructor() {
    super(
      "No eligible AI credentials are currently available. The service is temporarily unavailable.",
      "provider_error",
      false,
      503
    );
    this.name = "AllCredentialsUnavailableError";
  }
}

export class ModelNotFoundError extends GatewayError {
  constructor(modelId: string) {
    super(
      `Model '${modelId}' is not available or not registered.`,
      "model_unavailable",
      false,
      400
    );
    this.name = "ModelNotFoundError";
  }
}

export class EncryptionNotConfiguredError extends GatewayError {
  constructor() {
    super(
      "Credential encryption is not configured. Set AI_CREDENTIAL_ENCRYPTION_KEY.",
      "unknown",
      false,
      503
    );
    this.name = "EncryptionNotConfiguredError";
  }
}

/**
 * Classify a Gemini API error response into a structured category.
 *
 * This is critical for correct credential lifecycle management:
 * - Some errors should disable a credential permanently (invalid key)
 * - Some errors should put it in cooldown (rate limit, quota)
 * - Some errors should trigger a retry with another credential
 * - Some errors should not trigger any credential change (bad request)
 */
export function classifyGeminiError(
  status: number,
  body: string
): {
  category: AiErrorCategory;
  retryable: boolean;
  cooldownSeconds?: number;
} {
  const lower = body.toLowerCase();

  // 429: Rate limit or quota exceeded
  if (status === 429) {
    if (lower.includes("quota") || lower.includes("resource_exhausted")) {
      return { category: "quota_exceeded", retryable: true, cooldownSeconds: 60 };
    }
    return { category: "rate_limit", retryable: true, cooldownSeconds: 30 };
  }

  // 400: Bad request — do not retry, do not penalize credential
  if (status === 400) {
    return { category: "request_invalid", retryable: false };
  }

  // 401: Authentication failure — credential is confirmed invalid
  if (status === 401) {
    return { category: "auth_failure", retryable: false };
  }

  // 403: Permission/billing — IMPORTANT: not automatically an invalid key
  if (status === 403) {
    if (lower.includes("api_key_invalid") || lower.includes("invalid api key")) {
      return { category: "invalid_credential", retryable: false };
    }
    if (lower.includes("billing") || lower.includes("payment_required")) {
      // Billing issues need longer cooldown, not permanent disabling
      return {
        category: "billing_restricted",
        retryable: false,
        cooldownSeconds: 3600,
      };
    }
    if (lower.includes("model") && lower.includes("not supported")) {
      return { category: "model_unavailable", retryable: false };
    }
    // Generic 403 — conservative cooldown, not permanent
    return {
      category: "permission_denied",
      retryable: false,
      cooldownSeconds: 300,
    };
  }

  // 404: Resource not found
  if (status === 404) {
    if (lower.includes("model")) {
      return { category: "model_unavailable", retryable: false };
    }
    return { category: "unknown", retryable: false };
  }

  // 5xx: Provider-side errors — retry with backoff
  if (status >= 500 && status < 600) {
    return { category: "provider_error", retryable: true, cooldownSeconds: 15 };
  }

  return { category: "unknown", retryable: false };
}

/**
 * Parse a Retry-After header (seconds or HTTP-date) into seconds.
 * Caps at 1 hour to prevent excessively long cooldowns.
 */
export function parseRetryAfterHeader(
  retryAfterHeader: string | null
): number | undefined {
  if (!retryAfterHeader) return undefined;

  const numeric = parseInt(retryAfterHeader, 10);
  if (!isNaN(numeric) && numeric > 0) {
    return Math.min(numeric, 3600);
  }

  const date = new Date(retryAfterHeader);
  if (!isNaN(date.getTime())) {
    const seconds = Math.ceil((date.getTime() - Date.now()) / 1000);
    return Math.max(1, Math.min(seconds, 3600));
  }

  return undefined;
}
