import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "../../auth/jwt";
import { TEST_USER } from "../helper";

describe("JWT helpers", () => {
  it("round-trips the payload", () => {
    expect(verifyToken(signToken(TEST_USER))).toMatchObject(TEST_USER);
  });

  it("rejects a token signed with another secret", () => {
    expect(() => verifyToken(jwt.sign(TEST_USER, "other-secret"))).toThrow();
  });

  it("expires tokens after one hour", () => {
    const { exp, iat } = verifyToken(signToken(TEST_USER)) as unknown as { exp: number; iat: number };
    expect(exp - iat).toBe(3600);
  });
});
