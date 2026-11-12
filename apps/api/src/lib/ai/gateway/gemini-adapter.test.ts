/**
 * Gemini adapter and multimodal tests
 *
 * Tests the Gemini adapter using mocked SDK responses.
 * No real API calls are made. No real credentials used.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GatewayError } from "./errors";

// We test the error classification logic within the adapter
// by exporting a testable helper. The main generate/stream functions
// require the full @google/genai SDK which needs credentials.

describe("Gemini adapter - Live token provisioning (mocked fetch)", () => {
  const TEST_API_KEY = "AIzaSyFakeKeyForTesting12345";

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ephemeral token from successful response", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          name: "token_abc123",
          expireTime: "2026-11-12T09:00:00Z",
          newSessionExpireTime: "2026-11-12T08:31:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const { geminiProvisionLiveToken } = await import(
      "./gemini-adapter"
    );
    const { ModelRegistry } = await import("./model-registry");

    const registry = new ModelRegistry();
    const model = registry.getDefaultLiveModel();

    const result = await geminiProvisionLiveToken(TEST_API_KEY, model);

    expect(result.ephemeralToken).toBe("token_abc123");
    expect(result.wsUrl).toContain("wss://");
    // The original API key must NOT appear in the result
    expect(JSON.stringify(result)).not.toContain(TEST_API_KEY);
  });

  it("throws GatewayError on 403 response", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { code: 403, message: "Forbidden" } }),
        { status: 403 }
      )
    );

    const { geminiProvisionLiveToken } = await import(
      "./gemini-adapter"
    );
    const { ModelRegistry } = await import("./model-registry");

    const registry = new ModelRegistry();
    const model = registry.getDefaultLiveModel();

    await expect(
      geminiProvisionLiveToken(TEST_API_KEY, model)
    ).rejects.toThrow(GatewayError);
  });

  it("throws on network error", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    const { geminiProvisionLiveToken } = await import(
      "./gemini-adapter"
    );
    const { ModelRegistry } = await import("./model-registry");

    const registry = new ModelRegistry();
    const model = registry.getDefaultLiveModel();

    await expect(
      geminiProvisionLiveToken(TEST_API_KEY, model)
    ).rejects.toThrow(GatewayError);
  });

  it("never includes the permanent API key in a live session result", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          name: "short_lived_token_xyz",
          expireTime: "2026-11-12T09:00:00Z",
          newSessionExpireTime: "2026-11-12T08:31:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const { geminiProvisionLiveToken } = await import(
      "./gemini-adapter"
    );
    const { ModelRegistry } = await import("./model-registry");

    const registry = new ModelRegistry();
    const model = registry.getDefaultLiveModel();
    const permanentKey = "AIzaSyPermanentKeyThatMustNeverBeExposed";

    const result = await geminiProvisionLiveToken(permanentKey, model);

    // Permanent API key must not appear anywhere in the result
    const resultJson = JSON.stringify(result);
    expect(resultJson).not.toContain(permanentKey);
    // The ephemeral token is what the client uses
    expect(result.ephemeralToken).toBe("short_lived_token_xyz");
  });
});

describe("Multimodal content building", () => {
  it("model registry correctly identifies multimodal-capable models", async () => {
    const { ModelRegistry } = await import("./model-registry");
    const registry = new ModelRegistry();

    const imageCapableModels = registry.getModelsWithCapability("imageInput");
    expect(imageCapableModels.length).toBeGreaterThanOrEqual(1);
    // gemini-flash should support image input
    expect(
      imageCapableModels.some((m) => m.id === "gemini-flash")
    ).toBe(true);
  });

  it("live model supports realtime audio but not text output", async () => {
    const { ModelRegistry } = await import("./model-registry");
    const registry = new ModelRegistry();

    const liveModel = registry.getModel("gemini-live");
    expect(liveModel).toBeDefined();
    expect(liveModel!.capabilities.realtimeAudio).toBe(true);
    expect(liveModel!.capabilities.audioOutput).toBe(true);
    expect(liveModel!.capabilities.textOutput).toBe(false);
  });

  it("flash-lite model does not support audio input", async () => {
    const { ModelRegistry } = await import("./model-registry");
    const registry = new ModelRegistry();

    const model = registry.getModel("gemini-flash-lite");
    expect(model).toBeDefined();
    expect(model!.capabilities.audioInput).toBe(false);
  });
});
