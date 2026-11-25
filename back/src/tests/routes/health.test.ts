import { getTestApp } from "../helper";
import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";

describe("GET /api/health", () => {
    let app: Express;

    beforeAll(async () => {
	app = await getTestApp();
    })

  it("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});


