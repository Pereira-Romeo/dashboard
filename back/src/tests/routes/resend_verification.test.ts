import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

describe("POST /auth/resend_verification (validation only)", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it.each([
    ["an empty body", {}],
    ["an invalid email", { email: "nope" }],
  ])("rejects %s with 400", async (_label, body) => {
    const res = await request(app).post("/auth/resend-verification").send(body);
    expect(res.status).toBe(400);
  });

  it("rejects a request with no body at all", async () => {
    const res = await request(app).post("/auth/resend-verification");
    expect(res.status).toBe(400);
  });
});

