/**
 * Shared types and validation schemas for the AI Gateway.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Error categories
// ---------------------------------------------------------------------------
export type AiErrorCategory =
  | "invalid_credential"
  | "auth_failure"
  | "permission_denied"
  | "model_unavailable"
  | "request_invalid"
  | "rate_limit"
  | "quota_exceeded"
  | "billing_restricted"
  | "provider_error"
  | "network_error"
  | "timeout"
  | "unknown";

// ---------------------------------------------------------------------------
// Model capability flags
// ---------------------------------------------------------------------------
export interface ModelCapabilities {
  textInput: boolean;
  textOutput: boolean;
  imageInput: boolean;
  imageGeneration: boolean;
  audioInput: boolean;
  audioOutput: boolean;
  realtimeAudio: boolean;
  streaming: boolean;
  structuredOutput: boolean;
  functionCalling: boolean;
}

export interface ModelDefinition {
  /** Internal ID used by the gateway (e.g. 'gemini-flash') */
  id: string;
  /** Actual API model identifier (e.g. 'gemini-2.5-flash') */
  apiName: string;
  provider: string;
  displayName: string;
  capabilities: ModelCapabilities;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Credential types
// ---------------------------------------------------------------------------
export interface CredentialRecord {
  id: string;
  provider: string;
  name: string;
  encryptedKey: string;
  keyIv: string;
  keyVersion: number;
  maskedKey: string;
  status: "active" | "disabled" | "invalid" | "cooldown";
  lastUsedAt: Date | null;
  lastSuccessfulUseAt: Date | null;
  lastErrorCategory: AiErrorCategory | null;
  cooldownUntil: Date | null;
  consecutiveFailures: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe credential for API responses — no encrypted data */
export interface SafeCredential {
  id: string;
  provider: string;
  name: string;
  maskedKey: string;
  status: "active" | "disabled" | "invalid" | "cooldown";
  lastUsedAt: string | null;
  lastSuccessfulUseAt: string | null;
  lastErrorCategory: AiErrorCategory | null;
  cooldownUntil: string | null;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Gateway request/response types
// ---------------------------------------------------------------------------
export type Modality = "text" | "multimodal" | "audio" | "streaming" | "live";

export interface TextInput {
  text: string;
}

export interface ImagePart {
  /** MIME type, e.g. 'image/jpeg', 'image/png' */
  mimeType: string;
  /** Base64-encoded image bytes */
  data: string;
}

export interface MultimodalInput {
  text?: string;
  images?: ImagePart[];
  /** Base64-encoded audio bytes */
  audioData?: string;
  /** MIME type of audio, e.g. 'audio/webm' */
  audioMimeType?: string;
}

export interface GatewayGenerateRequest {
  /** Internal model ID, e.g. 'gemini-flash'. Defaults to gateway default. */
  model?: string;
  input: TextInput | MultimodalInput;
  taskType?: string;
  userId?: string;
  systemInstruction?: string;
  maxOutputTokens?: number;
  temperature?: number;
  requestId?: string;
}

export interface GatewayGenerateResult {
  text: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  credentialId?: string;
  requestId: string;
  latencyMs: number;
}

export interface LiveSessionRequest {
  userId: string;
  /** Internal model ID. Defaults to 'gemini-live'. */
  model?: string;
  responseModalities?: string[];
  systemInstruction?: string;
}

export interface LiveSessionResult {
  /** Short-lived token (token.name) — client uses this as apiKey for WSS */
  ephemeralToken: string;
  model: string;
  expiresAt: string;
  newSessionExpiresAt: string;
  /** WSS URL for client connection */
  wsUrl: string;
}

// ---------------------------------------------------------------------------
// Validation schemas (for API request bodies)
// ---------------------------------------------------------------------------
export const addCredentialSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  apiKey: z.string().min(10, "API key is too short").max(500),
  provider: z.string().default("gemini"),
});

export const updateCredentialNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export type AddCredentialInput = z.infer<typeof addCredentialSchema>;
export type UpdateCredentialNameInput = z.infer<typeof updateCredentialNameSchema>;
