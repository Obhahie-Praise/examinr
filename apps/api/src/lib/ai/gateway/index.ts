/**
 * AI Gateway — public interface
 *
 * This is the central interface for all Examinr AI features.
 * Application features use this module instead of making direct provider calls.
 * The gateway owns credential selection, rotation, failover, and usage tracking.
 *
 * Usage:
 *   const gateway = createAiGateway(db, env.AI_CREDENTIAL_ENCRYPTION_KEY);
 *
 *   // Standard text generation
 *   const result = await gateway.generate({
 *     model: 'gemini-flash',
 *     input: { text: 'Explain Newton\'s second law' },
 *   });
 *
 *   // Streaming
 *   for await (const chunk of gateway.stream({ input: { text: '...' } })) {
 *     // stream chunk to client
 *   }
 *
 *   // Live session (for real-time voice)
 *   const session = await gateway.provisionLiveSession({ userId: '...' });
 *   // return session.ephemeralToken to client — never return an API key
 */
import type { Db } from "../../../db";
import { CredentialManager } from "./credential-manager";
import { CredentialRouter, type RetryContext } from "./router";
import { ModelRegistry } from "./model-registry";
import { UsageManager } from "./usage-manager";
import {
  geminiGenerate,
  geminiStream,
  geminiProvisionLiveToken,
  geminiTestCredential,
} from "./gemini-adapter";
import { GatewayError, AllCredentialsUnavailableError } from "./errors";
import type {
  GatewayGenerateRequest,
  GatewayGenerateResult,
  LiveSessionRequest,
  LiveSessionResult,
  SafeCredential,
} from "./types";

// Re-export types used by application features
export * from "./types";
export { GatewayError, AllCredentialsUnavailableError } from "./errors";
export { CredentialManager } from "./credential-manager";
export { ModelRegistry } from "./model-registry";
export { UsageManager } from "./usage-manager";

export interface AiGateway {
  /** Generate a single text or multimodal response */
  generate(request: GatewayGenerateRequest): Promise<GatewayGenerateResult>;
  /** Stream a text response (yields text chunks) */
  stream(request: GatewayGenerateRequest): AsyncGenerator<string>;
  /** Provision an ephemeral Live session token for the browser client */
  provisionLiveSession(request: LiveSessionRequest): Promise<LiveSessionResult>;
  /** Test a credential by making a minimal real API call */
  testCredential(credentialId: string): Promise<{ valid: boolean; error?: string; model?: string }>;
  /** Access the credential manager for CRUD operations */
  credentials: CredentialManager;
  /** Access the model registry */
  models: ModelRegistry;
  /** Access usage tracking */
  usage: UsageManager;
}

/**
 * Create a new AI Gateway instance.
 * Call this per-request using the D1 binding and encryption key from env.
 */
export function createAiGateway(db: Db, encryptionKey: string): AiGateway {
  if (!encryptionKey) {
    throw new Error(
      "AI_CREDENTIAL_ENCRYPTION_KEY is required. " +
      "Generate with: openssl rand -base64 32 and configure with: wrangler secret put AI_CREDENTIAL_ENCRYPTION_KEY"
    );
  }

  const credentials = new CredentialManager(db, encryptionKey);
  const models = new ModelRegistry();
  const usageManager = new UsageManager(db);
  const router = new CredentialRouter(credentials, db);

  /**
   * Generate a single AI response with automatic credential failover.
   * Retries up to MAX_ATTEMPTS using LRU credential selection.
   */
  async function generate(
    request: GatewayGenerateRequest
  ): Promise<GatewayGenerateResult> {
    const requestId = request.requestId ?? crypto.randomUUID();
    const model = models.resolveModel(request.model, "text");
    const startTime = Date.now();

    let retryCtx: RetryContext = router.initialContext();

    while (true) {
      let route;
      try {
        route = await router.selectCredential(model.provider, retryCtx);
      } catch (err) {
        // No eligible credentials — record and surface
        await usageManager.recordUsage({
          provider: model.provider,
          model: model.apiName,
          status: "failure",
          errorCategory: "provider_error",
          requestId,
        });
        throw err;
      }

      await usageManager.recordRouteEvent({
        requestId,
        credentialId: route.credentialId,
        provider: model.provider,
        model: model.apiName,
        eventType: "selected",
      });

      try {
        const result = await geminiGenerate(route.decryptedKey, model, {
          ...request,
          requestId,
        });

        await credentials.recordSuccess(route.credentialId);
        await usageManager.recordUsage({
          credentialId: route.credentialId,
          provider: model.provider,
          model: model.apiName,
          modality: "text",
          taskType: request.taskType,
          userId: request.userId,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens:
            (result.inputTokens ?? 0) + (result.outputTokens ?? 0) || undefined,
          latencyMs: Date.now() - startTime,
          status: "success",
          retryCount: retryCtx.attemptNumber,
          requestId,
        });

        return { ...result, credentialId: route.credentialId, requestId };
      } catch (err) {
        const gatewayErr = toGatewayError(err);

        await credentials.recordFailure(
          route.credentialId,
          gatewayErr.category,
          cooldownSecondsFor(gatewayErr.category)
        );

        await usageManager.recordRouteEvent({
          requestId,
          credentialId: route.credentialId,
          provider: model.provider,
          model: model.apiName,
          eventType: "failed",
          errorCategory: gatewayErr.category,
        });

        // Non-retryable errors (bad request, invalid key) fail immediately
        if (!gatewayErr.retryable) {
          await usageManager.recordUsage({
            credentialId: route.credentialId,
            provider: model.provider,
            model: model.apiName,
            status: "failure",
            errorCategory: gatewayErr.category,
            requestId,
          });
          throw gatewayErr;
        }

        // Build new retry context and try another credential
        retryCtx = router.buildRetryContext(
          retryCtx,
          route.credentialId,
          gatewayErr.category
        );

        await usageManager.recordRouteEvent({
          requestId,
          credentialId: route.credentialId,
          provider: model.provider,
          model: model.apiName,
          eventType: "retry",
          errorCategory: gatewayErr.category,
        });
      }
    }
  }

  /**
   * Stream a generation response.
   * Selects a credential upfront. No transparent failover after streaming begins.
   */
  async function* stream(
    request: GatewayGenerateRequest
  ): AsyncGenerator<string> {
    const requestId = request.requestId ?? crypto.randomUUID();
    const model = models.resolveModel(request.model, "streaming");
    const startTime = Date.now();

    // Select credential once — no retry after streaming begins
    const route = await router.selectCredential(model.provider);

    await usageManager.recordRouteEvent({
      requestId,
      credentialId: route.credentialId,
      provider: model.provider,
      model: model.apiName,
      eventType: "selected",
    });

    try {
      for await (const chunk of geminiStream(route.decryptedKey, model, {
        ...request,
        requestId,
      })) {
        yield chunk;
      }
      await credentials.recordSuccess(route.credentialId);
      await usageManager.recordUsage({
        credentialId: route.credentialId,
        provider: model.provider,
        model: model.apiName,
        modality: "streaming",
        taskType: request.taskType,
        userId: request.userId,
        latencyMs: Date.now() - startTime,
        status: "success",
        requestId,
      });
    } catch (err) {
      const gatewayErr = toGatewayError(err);
      await credentials.recordFailure(
        route.credentialId,
        gatewayErr.category,
        cooldownSecondsFor(gatewayErr.category)
      );
      await usageManager.recordUsage({
        credentialId: route.credentialId,
        provider: model.provider,
        model: model.apiName,
        modality: "streaming",
        status: "failure",
        errorCategory: gatewayErr.category,
        requestId,
      });
      throw gatewayErr;
    }
  }

  /**
   * Provision an ephemeral token for a Gemini Live API session.
   * The ephemeral token is returned to the browser client — the original API
   * key is NEVER sent to the browser under any circumstances.
   */
  async function provisionLiveSession(
    request: LiveSessionRequest
  ): Promise<LiveSessionResult> {
    const requestId = crypto.randomUUID();
    const model = models.resolveModel(request.model ?? "gemini-live", "live");
    const route = await router.selectCredential(model.provider);

    try {
      const result = await geminiProvisionLiveToken(route.decryptedKey, model, {
        systemInstruction: request.systemInstruction,
        responseModalities: request.responseModalities,
      });

      await credentials.recordSuccess(route.credentialId);
      await usageManager.recordUsage({
        credentialId: route.credentialId,
        provider: model.provider,
        model: model.apiName,
        modality: "live",
        userId: request.userId,
        status: "success",
        requestId,
      });

      return result;
    } catch (err) {
      const gatewayErr = toGatewayError(err);
      await credentials.recordFailure(
        route.credentialId,
        gatewayErr.category,
        cooldownSecondsFor(gatewayErr.category)
      );
      await usageManager.recordUsage({
        provider: model.provider,
        model: model.apiName,
        modality: "live",
        status: "failure",
        errorCategory: gatewayErr.category,
        requestId,
      });
      throw gatewayErr;
    }
  }

  async function testCredential(
    credentialId: string
  ): Promise<{ valid: boolean; error?: string; model?: string }> {
    const decryptedKey = await credentials.getDecryptedKey(credentialId);
    return geminiTestCredential(decryptedKey);
  }

  return {
    generate,
    stream,
    provisionLiveSession,
    testCredential,
    credentials,
    models,
    usage: usageManager,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function toGatewayError(err: unknown): GatewayError {
  if (err instanceof GatewayError) return err;
  if (err instanceof Error) {
    return new GatewayError(err.message, "unknown", false, 500);
  }
  return new GatewayError("Unknown error", "unknown", false, 500);
}

function cooldownSecondsFor(category: string): number | undefined {
  switch (category) {
    case "quota_exceeded":
      return 60;
    case "rate_limit":
      return 30;
    case "provider_error":
      return 15;
    case "billing_restricted":
      return 3600;
    default:
      return undefined;
  }
}
