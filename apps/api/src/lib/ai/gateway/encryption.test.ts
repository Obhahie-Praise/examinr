/**
 * Encryption service tests
 *
 * Tests AES-256-GCM encryption via the Web Crypto API (available in Node.js 18+).
 * These tests do NOT require Cloudflare Workers — Web Crypto is available globally in Node.
 */
import { describe, it, expect } from "vitest";
import { encrypt, decrypt, maskApiKey } from "./encryption";

// A valid 32-byte base64 key for testing
const TEST_KEY = Buffer.from(new Uint8Array(32).fill(0x42)).toString("base64");
const DIFFERENT_KEY = Buffer.from(new Uint8Array(32).fill(0x99)).toString("base64");

describe("Encryption", () => {
  it("encrypts and decrypts a plaintext credential", async () => {
    const plaintext = "AIzaSyFakeKeyForTesting123456";
    const encrypted = await encrypt(plaintext, TEST_KEY);

    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.version).toBe(1);

    const decrypted = await decrypt(encrypted, TEST_KEY);
    expect(decrypted).toBe(plaintext);
  });

  it("generates a unique IV for each encryption operation", async () => {
    const plaintext = "AIzaSyFakeKeyForTesting123456";
    const enc1 = await encrypt(plaintext, TEST_KEY);
    const enc2 = await encrypt(plaintext, TEST_KEY);

    expect(enc1.iv).not.toBe(enc2.iv);
    // Different IVs → different ciphertexts even for same plaintext
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  it("throws on decryption with wrong key", async () => {
    const plaintext = "AIzaSyFakeKeyForTesting123456";
    const encrypted = await encrypt(plaintext, TEST_KEY);

    await expect(decrypt(encrypted, DIFFERENT_KEY)).rejects.toThrow(
      /Decryption failed/
    );
  });

  it("throws on decryption with tampered ciphertext", async () => {
    const plaintext = "AIzaSyFakeKeyForTesting123456";
    const encrypted = await encrypt(plaintext, TEST_KEY);

    const tampered = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.slice(0, -4) + "XXXX",
    };

    await expect(decrypt(tampered, TEST_KEY)).rejects.toThrow(
      /Decryption failed/
    );
  });

  it("throws on decryption with modified IV", async () => {
    const plaintext = "AIzaSyFakeKeyForTesting123456";
    const encrypted = await encrypt(plaintext, TEST_KEY);

    const modifiedIv = {
      ...encrypted,
      iv: Buffer.from(new Uint8Array(12).fill(0xaa)).toString("base64"),
    };

    await expect(decrypt(modifiedIv, TEST_KEY)).rejects.toThrow(
      /Decryption failed/
    );
  });

  it("throws when encryption key is missing", async () => {
    await expect(encrypt("test", "")).rejects.toThrow(
      /AI_CREDENTIAL_ENCRYPTION_KEY/
    );
  });

  it("throws when encryption key is invalid base64", async () => {
    await expect(encrypt("test", "not-valid-base64!!!")).rejects.toThrow(
      /base64/
    );
  });

  it("throws when encryption key is wrong length", async () => {
    // 16 bytes → 24 chars base64 → not 32 bytes
    const shortKey = Buffer.from(new Uint8Array(16).fill(0x42)).toString("base64");
    await expect(encrypt("test", shortKey)).rejects.toThrow(/32 bytes/);
  });

  it("stores ciphertext not plaintext", async () => {
    const plaintext = "AIzaSySecretApiKeyValue12345";
    const encrypted = await encrypt(plaintext, TEST_KEY);

    // The plaintext must not appear in any encrypted field
    expect(encrypted.ciphertext).not.toContain(plaintext);
    expect(encrypted.iv).not.toContain(plaintext);
    expect(JSON.stringify(encrypted)).not.toContain(plaintext);
  });
});

describe("maskApiKey", () => {
  it("masks a typical API key showing only last 4 chars", () => {
    const masked = maskApiKey("AIzaSyFakeKeyForTesting1234");
    expect(masked).toBe("••••••••1234");
  });

  it("handles short keys gracefully", () => {
    const masked = maskApiKey("abc");
    expect(masked).toBe("••••••••");
  });

  it("never includes the full key in the masked value", () => {
    const key = "AIzaSyFakeKeyForTesting1234";
    const masked = maskApiKey(key);
    expect(masked).not.toContain("AIzaSy");
    expect(masked).not.toBe(key);
  });
});
