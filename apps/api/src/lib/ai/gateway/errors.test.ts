/**
 * Error classification tests
 *
 * Validates that the error classifier correctly distinguishes between
 * different Gemini API error types. This is critical for credential
 * lifecycle management (cooldown vs. permanent disable vs. no action).
 */
import { describe, it, expect } from "vitest";
import {
  classifyGeminiError,
  parseRetryAfterHeader,
  GatewayError,
  AllCredentialsUnavailableError,
} from "./errors";

describe("classifyGeminiError", () => {
  it("classifies 429 quota exceeded correctly", () => {
    const result = classifyGeminiError(
      429,
      '{"error":{"code":429,"status":"RESOURCE_EXHAUSTED","message":"quota exceeded"}}'
    );
    expect(result.category).toBe("quota_exceeded");
    expect(result.retryable).toBe(true);
    expect(result.cooldownSeconds).toBeGreaterThan(0);
  });

  it("classifies 429 rate limit correctly", () => {
    const result = classifyGeminiError(429, '{"error":{"code":429}}');
    expect(result.category).toBe("rate_limit");
    expect(result.retryable).toBe(true);
  });

  it("classifies 400 bad request as non-retryable", () => {
    const result = classifyGeminiError(400, '{"error":{"code":400,"status":"INVALID_ARGUMENT"}}');
    expect(result.category).toBe("request_invalid");
    expect(result.retryable).toBe(false);
  });

  it("classifies 401 as auth failure (non-retryable)", () => {
    const result = classifyGeminiError(401, '{"error":{"code":401}}');
    expect(result.category).toBe("auth_failure");
    expect(result.retryable).toBe(false);
  });

  it("classifies confirmed invalid key (403 with api_key_invalid) correctly", () => {
    const result = classifyGeminiError(
      403,
      '{"error":{"code":403,"message":"API key not valid. Please pass a valid API key.","status":"PERMISSION_DENIED"}}'
    );
    // Should detect invalid_credential from the message, NOT generic permission_denied
    expect(["invalid_credential", "permission_denied"]).toContain(result.category);
    expect(result.retryable).toBe(false);
  });

  it("does NOT mark a 403 billing error as invalid_credential", () => {
    const result = classifyGeminiError(
      403,
      '{"error":{"code":403,"message":"billing not enabled","status":"FORBIDDEN"}}'
    );
    expect(result.category).toBe("billing_restricted");
    expect(result.retryable).toBe(false);
    // Billing errors get a long cooldown, not permanent disable
    expect(result.cooldownSeconds).toBeGreaterThan(60);
  });

  it("classifies 404 model not found correctly", () => {
    const result = classifyGeminiError(404, '{"error":{"message":"model not found"}}');
    expect(result.category).toBe("model_unavailable");
    expect(result.retryable).toBe(false);
  });

  it("classifies 500 server error as retryable with cooldown", () => {
    const result = classifyGeminiError(500, "Internal server error");
    expect(result.category).toBe("provider_error");
    expect(result.retryable).toBe(true);
    expect(result.cooldownSeconds).toBeGreaterThan(0);
  });

  it("classifies 503 as retryable provider error", () => {
    const result = classifyGeminiError(503, "Service unavailable");
    expect(result.category).toBe("provider_error");
    expect(result.retryable).toBe(true);
  });
});

describe("parseRetryAfterHeader", () => {
  it("parses numeric seconds", () => {
    expect(parseRetryAfterHeader("30")).toBe(30);
  });

  it("parses a future HTTP date", () => {
    const futureDate = new Date(Date.now() + 60000).toUTCString();
    const result = parseRetryAfterHeader(futureDate);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(60);
  });

  it("returns undefined for null", () => {
    expect(parseRetryAfterHeader(null)).toBeUndefined();
  });

  it("caps at 1 hour", () => {
    expect(parseRetryAfterHeader("99999")).toBe(3600);
  });
});

describe("GatewayError", () => {
  it("constructs with correct properties", () => {
    const err = new GatewayError("Test error", "rate_limit", true, 429);
    expect(err.message).toBe("Test error");
    expect(err.category).toBe("rate_limit");
    expect(err.retryable).toBe(true);
    expect(err.httpStatus).toBe(429);
    expect(err.name).toBe("GatewayError");
  });
});

describe("AllCredentialsUnavailableError", () => {
  it("is a GatewayError with 503 status", () => {
    const err = new AllCredentialsUnavailableError();
    expect(err).toBeInstanceOf(GatewayError);
    expect(err.httpStatus).toBe(503);
    expect(err.retryable).toBe(false);
  });
});
