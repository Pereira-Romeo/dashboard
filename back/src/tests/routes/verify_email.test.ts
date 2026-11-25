import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

describe("GET /auth/verify-email (no-token paths)", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it.each(["/auth/verify-email", "/auth/verify-email?token="])("rejects %s with 400", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(400);
  });
});

