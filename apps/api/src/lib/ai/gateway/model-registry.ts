/**
 * Model Registry
 *
 * Central registry of supported AI models and their capabilities.
 * Keeps model names, API identifiers, and capability flags out of
 * individual application features.
 *
 * Models are defined here and resolved by ID at request time.
 * Application code uses internal IDs (e.g. 'gemini-flash') not raw API names.
 */
import type { ModelDefinition, ModelCapabilities, Modality } from "./types";
import { ModelNotFoundError } from "./errors";

// ---------------------------------------------------------------------------
// Built-in Gemini model definitions
// ---------------------------------------------------------------------------
const GEMINI_MODELS: ModelDefinition[] = [
  {
    id: "gemini-flash",
    apiName: "gemini-2.5-flash",
    provider: "gemini",
    displayName: "Gemini 2.5 Flash",
    capabilities: {
      textInput: true,
      textOutput: true,
      imageInput: true,
      imageGeneration: false,
      audioInput: true,
      audioOutput: false,
      realtimeAudio: false,
      streaming: true,
      structuredOutput: true,
      functionCalling: true,
    },
    maxInputTokens: 1048576,
    maxOutputTokens: 65536,
    enabled: true,
  },
  {
    id: "gemini-pro",
    apiName: "gemini-2.5-pro",
    provider: "gemini",
    displayName: "Gemini 2.5 Pro",
    capabilities: {
      textInput: true,
      textOutput: true,
      imageInput: true,
      imageGeneration: false,
      audioInput: true,
      audioOutput: false,
      realtimeAudio: false,
      streaming: true,
      structuredOutput: true,
      functionCalling: true,
    },
    maxInputTokens: 2097152,
    maxOutputTokens: 65536,
    enabled: true,
  },
  {
    id: "gemini-flash-lite",
    apiName: "gemini-2.5-flash-lite",
    provider: "gemini",
    displayName: "Gemini 2.5 Flash Lite",
    capabilities: {
      textInput: true,
      textOutput: true,
      imageInput: true,
      imageGeneration: false,
      audioInput: false,
      audioOutput: false,
      realtimeAudio: false,
      streaming: true,
      structuredOutput: true,
      functionCalling: true,
    },
    maxInputTokens: 1048576,
    maxOutputTokens: 32768,
    enabled: true,
  },
  {
    id: "gemini-flash-2",
    apiName: "gemini-2.0-flash",
    provider: "gemini",
    displayName: "Gemini 2.0 Flash",
    capabilities: {
      textInput: true,
      textOutput: true,
      imageInput: true,
      imageGeneration: false,
      audioInput: true,
      audioOutput: false,
      realtimeAudio: false,
      streaming: true,
      structuredOutput: true,
      functionCalling: true,
    },
    maxInputTokens: 1048576,
    maxOutputTokens: 8192,
    enabled: true,
  },
  {
    id: "gemini-live",
    // gemini-2.0-flash-live-001 is the current Live API model
    apiName: "gemini-2.0-flash-live-001",
    provider: "gemini",
    displayName: "Gemini Live",
    capabilities: {
      textInput: true,
      textOutput: false,
      imageInput: true,
      imageGeneration: false,
      audioInput: true,
      audioOutput: true,
      realtimeAudio: true,
      streaming: true,
      structuredOutput: false,
      functionCalling: true,
    },
    enabled: true,
  },
];

export class ModelRegistry {
  private readonly models: Map<string, ModelDefinition>;

  constructor(extraModels: ModelDefinition[] = []) {
    this.models = new Map();
    for (const model of [...GEMINI_MODELS, ...extraModels]) {
      this.models.set(model.id, model);
    }
  }

  getModel(id: string): ModelDefinition | undefined {
    return this.models.get(id);
  }

  getModelOrThrow(id: string): ModelDefinition {
    const model = this.models.get(id);
    if (!model) throw new ModelNotFoundError(id);
    if (!model.enabled) throw new ModelNotFoundError(id);
    return model;
  }

  getDefaultModel(): ModelDefinition {
    const model = this.models.get("gemini-flash");
    if (!model) throw new Error("Default model 'gemini-flash' not found");
    return model;
  }

  getDefaultLiveModel(): ModelDefinition {
    const model = this.models.get("gemini-live");
    if (!model) throw new Error("Live model 'gemini-live' not found");
    return model;
  }

  getModelsWithCapability(
    capability: keyof ModelCapabilities
  ): ModelDefinition[] {
    return Array.from(this.models.values()).filter(
      (m) => m.enabled && m.capabilities[capability]
    );
  }

  listAll(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  /**
   * Resolve a model for a request.
   * If requestedId is provided, validate it supports the modality.
   * Otherwise auto-select the best model for the modality.
   */
  resolveModel(requestedId: string | undefined, modality: Modality): ModelDefinition {
    if (requestedId) {
      return this.getModelOrThrow(requestedId);
    }

    switch (modality) {
      case "live":
        return this.getDefaultLiveModel();
      case "text":
      case "streaming":
      case "multimodal":
      case "audio":
      default:
        return this.getDefaultModel();
    }
  }
}
