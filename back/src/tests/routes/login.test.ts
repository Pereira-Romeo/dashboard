import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

const badBodies: [string, Record<string, unknown>][] = [
  ["an empty body", {}],
  ["a missing password", { email: "alice@example.com" }],
  ["a missing email", { password: "changeme123" }],
  ["an invalid email", { email: "not-an-email", password: "changeme123" }],
];

describe("POST /login (validation only)", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it.each(badBodies)("rejects %s with 400", async (_label, body) => {
    const res = await request(app).post("/login").send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  it("rejects a request with no body at all", async () => {
    const res = await request(app).post("/login");
    expect(res.status).toBe(400);
  });

  it("rejects a body that isn't JSON", async () => {
    const res = await request(app).post("/login").set("Content-Type", "text/plain").send("hello");
    expect(res.status).toBe(400);
  });
});

