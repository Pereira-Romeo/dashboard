import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

const badBodies: [string, Record<string, unknown>][] = [
  ["an empty body", {}],
  ["an invalid email", { name: "Alice", email: "nope", password: "changeme123" }],
  ["a too-short password", { name: "Alice", email: "alice@example.com", password: "short" }],
];

describe("POST /signup (validation only)", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it.each(badBodies)("rejects %s with 400", async (_label, body) => {
    const res = await request(app).post("/sign_up").send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  it("rejects a request with no body at all", async () => {
    const res = await request(app).post("/sign_up");
    expect(res.status).toBe(400);
  });
});

