import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

describe("POST /auth/resend_verification rate limit", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("answers 429 once one IP exceeds the limit (10 per window)", async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app).post("/auth/resend-verification").send({ email: "nope" });
      expect(res.status).toBe(400);
    }

    const blocked = await request(app).post("/auth/resend-verification").send({ email: "nope" });
    expect(blocked.status).toBe(429);
  });
});

