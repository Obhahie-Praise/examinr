/**
 * Gemini Provider Adapter
 *
 * Handles all interactions with the Google Gemini API using the
 * official @google/genai SDK (replaces deprecated @google/generative-ai).
 *
 * Supports:
 * - Text generation
 * - Multimodal (text + images)
 * - Audio input
 * - Streaming text responses
 * - Live session ephemeral token provisioning
 * - Credential validation
 *
 * Notes on Cloudflare Workers compatibility:
 * - @google/genai uses fetch internally, which is compatible with CF Workers
 * - The nodejs_compat flag is set in wrangler.jsonc
 * - Live API ephemeral tokens use the REST API directly for maximum compatibility
 */
import { GoogleGenAI } from "@google/genai";
import { GatewayError, classifyGeminiError } from "./errors";
import type {
  GatewayGenerateRequest,
  GatewayGenerateResult,
  LiveSessionResult,
  MultimodalInput,
  ModelDefinition,
} from "./types";

// ---------------------------------------------------------------------------
// Text and multimodal generation
// ---------------------------------------------------------------------------

/**
 * Make a single (non-streaming) generation request to Gemini.
 */
export async function geminiGenerate(
  apiKey: string,
  model: ModelDefinition,
  request: GatewayGenerateRequest
): Promise<GatewayGenerateResult> {
  const client = new GoogleGenAI({ apiKey });
  const startTime = Date.now();
  const requestId = request.requestId ?? crypto.randomUUID();

  const contents = buildContents(request);
  const config = buildConfig(request);

  let response: Awaited<ReturnType<typeof client.models.generateContent>>;
  try {
    response = await client.models.generateContent({
      model: model.apiName,
      contents,
      ...(config ? { config } : {}),
    });
  } catch (err) {
    throw wrapSdkError(err);
  }

  const text = response.text ?? "";
  const usageMeta = response.usageMetadata;

  return {
    text,
    model: model.apiName,
    inputTokens: usageMeta?.promptTokenCount ?? undefined,
    outputTokens: usageMeta?.candidatesTokenCount ?? undefined,
    requestId,
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Stream a generation request.
 * Returns an AsyncGenerator of text chunks.
 *
 * IMPORTANT: Once streaming has begun, transparent credential failover is
 * not possible. Only attempt retries before the first chunk is yielded.
 */
export async function* geminiStream(
  apiKey: string,
  model: ModelDefinition,
  request: GatewayGenerateRequest
): AsyncGenerator<string> {
  const client = new GoogleGenAI({ apiKey });

  const contents = buildContents(request);
  const config = buildConfig(request);

  let stream: Awaited<ReturnType<typeof client.models.generateContentStream>>;
  try {
    stream = await client.models.generateContentStream({
      model: model.apiName,
      contents,
      ...(config ? { config } : {}),
    });
  } catch (err) {
    throw wrapSdkError(err);
  }

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) yield text;
  }
}

// ---------------------------------------------------------------------------
// Live session provisioning
// ---------------------------------------------------------------------------

/**
 * Provision an ephemeral token for a Gemini Live API session.
 *
 * Uses the REST API directly for maximum Cloudflare Workers compatibility.
 * The ephemeral token (token.name) is returned to the browser client —
 * the original API key is NEVER sent to the browser.
 *
 * The ephemeral token is a preview feature and only works with the Live API.
 * Token expiry: 30 minutes for session messages, 1 minute to start new session.
 */
export async function geminiProvisionLiveToken(
  apiKey: string,
  model: ModelDefinition,
  options: {
    expireMinutes?: number;
    newSessionExpireMinutes?: number;
    systemInstruction?: string;
    responseModalities?: string[];
  } = {}
): Promise<LiveSessionResult> {
  const expireMinutes = options.expireMinutes ?? 30;
  const newSessionExpireMinutes = options.newSessionExpireMinutes ?? 1;

  const expireTime = new Date(
    Date.now() + expireMinutes * 60 * 1000
  ).toISOString();
  const newSessionExpireTime = new Date(
    Date.now() + newSessionExpireMinutes * 60 * 1000
  ).toISOString();

  const liveConfig: Record<string, unknown> = {
    sessionResumption: {},
    responseModalities: options.responseModalities ?? ["AUDIO"],
  };

  if (options.systemInstruction) {
    liveConfig.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  const body: Record<string, unknown> = {
    uses: 1,
    expireTime,
    newSessionExpireTime,
    liveConnectConstraints: {
      model: `models/${model.apiName}`,
      config: liveConfig,
    },
  };

  let response: Response;
  try {
    response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/auth_tokens",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  } catch (err) {
    throw new GatewayError(
      "Network error provisioning Live session token",
      "network_error",
      true,
      503
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    const { category, retryable } = classifyGeminiError(
      response.status,
      errorBody
    );
    throw new GatewayError(
      `Failed to provision Live session token (${response.status})`,
      category,
      retryable,
      response.status >= 500 ? 503 : response.status
    );
  }

  const data = (await response.json()) as {
    name?: string;
    expireTime?: string;
    newSessionExpireTime?: string;
  };

  if (!data.name) {
    throw new GatewayError(
      "Live token response missing token name",
      "provider_error",
      false,
      503
    );
  }

  return {
    ephemeralToken: data.name,
    model: model.apiName,
    expiresAt: data.expireTime ?? expireTime,
    newSessionExpiresAt: data.newSessionExpireTime ?? newSessionExpireTime,
    // The browser uses the ephemeral token as the apiKey for this WSS connection
    wsUrl: "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent",
  };
}

// ---------------------------------------------------------------------------
// Credential validation
// ---------------------------------------------------------------------------

/**
 * Validate a credential by making a minimal real API call.
 * Uses the most lightweight available model to minimize cost.
 * Note: this will consume a small amount of the credential's quota.
 */
export async function geminiTestCredential(apiKey: string): Promise<{
  valid: boolean;
  model?: string;
  error?: string;
}> {
  const client = new GoogleGenAI({ apiKey });
  try {
    await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "Hi" }] }],
      config: { maxOutputTokens: 5 },
    });
    return { valid: true, model: "gemini-2.5-flash" };
  } catch (err) {
    const wrapped = wrapSdkError(err);
    return { valid: false, error: wrapped.message };
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type ContentPart = Record<string, unknown>;
type ContentItem = { role: string; parts: ContentPart[] };

function buildContents(request: GatewayGenerateRequest): ContentItem[] {
  const input = request.input;
  const parts: ContentPart[] = [];

  if ("text" in input && typeof input.text === "string") {
    parts.push({ text: input.text });
  } else {
    const multi = input as MultimodalInput;
    if (multi.text) {
      parts.push({ text: multi.text });
    }
    if (multi.images) {
      for (const img of multi.images) {
        parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          },
        });
      }
    }
    if (multi.audioData && multi.audioMimeType) {
      parts.push({
        inlineData: {
          mimeType: multi.audioMimeType,
          data: multi.audioData,
        },
      });
    }
  }

  return [{ role: "user", parts }];
}

function buildConfig(
  request: GatewayGenerateRequest
): Record<string, unknown> | null {
  const config: Record<string, unknown> = {};

  if (request.maxOutputTokens) config.maxOutputTokens = request.maxOutputTokens;
  if (request.temperature !== undefined) config.temperature = request.temperature;
  if (request.systemInstruction) {
    config.systemInstruction = {
      parts: [{ text: request.systemInstruction }],
    };
  }

  return Object.keys(config).length > 0 ? config : null;
}

function wrapSdkError(err: unknown): GatewayError {
  if (err instanceof GatewayError) return err;

  if (err instanceof Error) {
    const msg = err.message;
    const lower = msg.toLowerCase();

    if (lower.includes("api_key_invalid") || lower.includes("invalid api key")) {
      return new GatewayError(msg, "invalid_credential", false, 401);
    }
    if (lower.includes("quota") || lower.includes("resource_exhausted")) {
      return new GatewayError(msg, "quota_exceeded", true, 429);
    }
    if (lower.includes("rate") && lower.includes("limit")) {
      return new GatewayError(msg, "rate_limit", true, 429);
    }
    if (lower.includes("permission") || lower.includes("forbidden")) {
      return new GatewayError(msg, "permission_denied", false, 403);
    }
    if (lower.includes("model") && lower.includes("not found")) {
      return new GatewayError(msg, "model_unavailable", false, 404);
    }
    if (lower.includes("timeout") || lower.includes("time out")) {
      return new GatewayError(msg, "timeout", true, 504);
    }
    if (
      lower.includes("failed to fetch") ||
      lower.includes("network") ||
      lower.includes("econnreset")
    ) {
      return new GatewayError(msg, "network_error", true, 503);
    }

    return new GatewayError(msg, "unknown", false, 500);
  }

  return new GatewayError("Unknown error from Gemini provider", "unknown", false, 500);
}
