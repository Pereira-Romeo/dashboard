import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

const callbacks = [
  "/auth/github/callback?code=abc&state=bogus",
  "/auth/github/callback",
  "/auth/steam/callback?state=bogus",
  "/auth/steam/callback",
];

describe("OAuth/OpenID callbacks", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it.each(callbacks)("GET %s is public and rejects an unknown state with 400", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(400);
  });
});
