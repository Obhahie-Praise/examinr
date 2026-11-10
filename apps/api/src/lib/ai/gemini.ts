import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Default model for Gemini.
 * Centralized here so it can be changed in one place.
 */
export const GEMINI_DEFAULT_MODEL = "gemini-1.5-flash";

/**
 * Creates a GoogleGenerativeAI client using the provided API key.
 * The API key is read from the server environment — never exposed to the browser.
 *
 * Usage:
 *   const gemini = createGeminiClient(env.GEMINI_API_KEY);
 *   const model = getGeminiModel(gemini);
 */
export function createGeminiClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Returns a GenerativeModel using the default model.
 * Override modelName to use a different model for specific features.
 */
export function getGeminiModel(
  client: GoogleGenerativeAI,
  modelName: string = GEMINI_DEFAULT_MODEL,
) {
  return client.getGenerativeModel({ model: modelName });
}

/**
 * Returns a configuration status for health checks.
 * Does NOT make any real API requests (no credits consumed).
 */
export function getGeminiConfigStatus(apiKey: string | undefined): {
  configured: boolean;
  model: string;
} {
  return {
    configured: Boolean(apiKey && apiKey.length > 0),
    model: GEMINI_DEFAULT_MODEL,
  };
}
