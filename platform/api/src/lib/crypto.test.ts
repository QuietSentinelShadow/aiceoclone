import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./crypto.js";

describe("crypto", () => {
  const key = "test-encryption-key-32-chars-ok!";

  it("encrypts and decrypts a string", () => {
    const plaintext = "sk-ant-api-key-12345";
    const encrypted = encrypt(plaintext, key);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toContain(":");
    const decrypted = decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext each time", () => {
    const plaintext = "same-input";
    const a = encrypt(plaintext, key);
    const b = encrypt(plaintext, key);
    expect(a).not.toBe(b);
  });

  it("throws on tampered ciphertext", () => {
    const encrypted = encrypt("test", key);
    const tampered = "AAAA" + encrypted.slice(4);
    expect(() => decrypt(tampered, key)).toThrow();
  });
});
