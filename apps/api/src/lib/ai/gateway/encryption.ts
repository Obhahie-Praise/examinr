/**
 * Credential encryption service.
 *
 * Uses AES-256-GCM via the Web Crypto API (available in Cloudflare Workers).
 * The master key must be a base64-encoded 32-byte secret stored as the
 * AI_CREDENTIAL_ENCRYPTION_KEY Worker secret.
 *
 * Security properties:
 * - A unique IV is generated for each encryption operation
 * - AES-GCM provides authenticated encryption (ciphertext integrity guaranteed)
 * - A database dump without the external master key reveals no plaintext
 * - The master key is never stored in D1 or logged
 *
 * To generate a suitable key:
 *   openssl rand -base64 32
 *
 * To configure as a Worker secret:
 *   wrangler secret put AI_CREDENTIAL_ENCRYPTION_KEY
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12;   // bytes (96 bits, recommended for GCM)
const KEY_VERSION = 1;

export interface EncryptedValue {
  ciphertext: string; // base64-encoded ciphertext
  iv: string;         // base64-encoded IV
  version: number;    // key version for future rotation
}

/**
 * Import a base64-encoded master key as a CryptoKey.
 * Throws immediately if the key is missing, malformed, or wrong length.
 */
async function importMasterKey(base64Key: string): Promise<CryptoKey> {
  if (!base64Key || base64Key.trim().length === 0) {
    throw new Error(
      "AI_CREDENTIAL_ENCRYPTION_KEY is not set. " +
      "Generate one with: openssl rand -base64 32"
    );
  }

  let raw: Uint8Array;
  try {
    const binary = atob(base64Key.trim());
    raw = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      raw[i] = binary.charCodeAt(i);
    }
  } catch {
    throw new Error("AI_CREDENTIAL_ENCRYPTION_KEY is not valid base64.");
  }

  if (raw.length !== 32) {
    throw new Error(
      `AI_CREDENTIAL_ENCRYPTION_KEY must decode to exactly 32 bytes (got ${raw.length}).`
    );
  }

  return crypto.subtle.importKey("raw", raw, ALGORITHM, false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Generates a unique cryptographically secure IV for each call.
 * Never pass the plaintext to logs or error messages.
 */
export async function encrypt(
  plaintext: string,
  masterKeyB64: string
): Promise<EncryptedValue> {
  const key = await importMasterKey(masterKeyB64);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    version: KEY_VERSION,
  };
}

/**
 * Decrypt a previously encrypted value.
 * Throws if the key is wrong, ciphertext is tampered, or IV is invalid.
 * The error message does not reveal plaintext or key material.
 */
export async function decrypt(
  encrypted: EncryptedValue,
  masterKeyB64: string
): Promise<string> {
  const key = await importMasterKey(masterKeyB64);
  const iv = base64ToUint8Array(encrypted.iv);
  const ciphertext = base64ToUint8Array(encrypted.ciphertext);

  let plaintextBuffer: ArrayBuffer;
  try {
    plaintextBuffer = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );
  } catch {
    throw new Error(
      "Decryption failed. The encryption key may be incorrect, or the data may have been tampered with."
    );
  }

  return new TextDecoder().decode(plaintextBuffer);
}

/**
 * Mask an API key for safe display in admin interfaces.
 * Shows only the last 4 characters: "••••••••1234"
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 4) {
    return "•".repeat(8);
  }
  return "•".repeat(8) + apiKey.slice(-4);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
