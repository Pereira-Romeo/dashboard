import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

describe("generic error behaviour", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("answers 404 for an unknown route", async () => {
    const res = await request(app).get("/this-route-does-not-exist");
    expect(res.status).toBe(404);
  });

  it("answers 400, not 500, for a malformed JSON body", async () => {
    const res = await request(app)
      .post("/login")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
  });
});

