// back/src/tests/unit/crypto.test.ts
import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "../../auth/crypto";

describe("token encryption", () => {
  it("round-trips a value", () => {
    expect(decrypt(encrypt("gho_exampleToken123"))).toBe("gho_exampleToken123");
  });

  it("does not store the plaintext", () => {
    expect(encrypt("super-secret-token")).not.toContain("super-secret-token");
  });

  it("uses a fresh IV every time", () => {
    expect(encrypt("same")).not.toBe(encrypt("same"));
  });

  it("rejects a tampered value", () => {
    const payload = Buffer.from(encrypt("secret"), "base64");
    payload[payload.length - 1] ^= 1;
    expect(() => decrypt(payload.toString("base64"))).toThrow();
  });
});
