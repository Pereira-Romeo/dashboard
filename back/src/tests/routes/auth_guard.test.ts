import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { expiredToken, getTestApp, tokenSignedWithWrongSecret } from "../helper";

type Method = "get" | "post" | "put" | "patch" | "delete";

const protectedRoutes: [Method, string][] = [
  ["get", "/profile"],
  ["patch", "/profile"],
  ["delete", "/destroy"],
  ["get", "/dashboard/widgets"],
  ["put", "/dashboard/widgets"],
  ["get", "/service/weather/current_sky?lat=48.85&lon=2.35"],
  ["get", "/auth/github"],
  ["get", "/auth/steam"],
];

describe.each(protectedRoutes)("%s %s", (method, path) => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("rejects a request with no Authorization header", async () => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  it("rejects a non-Bearer scheme", async () => {
    const res = await request(app)[method](path).set("Authorization", "Basic dXNlcjpwYXNz");
    expect(res.status).toBe(401);
  });

  it("rejects a garbage token", async () => {
    const res = await request(app)[method](path).set("Authorization", "Bearer not-a-jwt");
    expect(res.status).toBe(401);
  });

  it("rejects a token signed with another secret", async () => {
    const res = await request(app)[method](path).set("Authorization", `Bearer ${tokenSignedWithWrongSecret()}`);
    expect(res.status).toBe(401);
  });

  it("rejects an expired token", async () => {
    const res = await request(app)[method](path).set("Authorization", `Bearer ${expiredToken()}`);
    expect(res.status).toBe(401);
  });
});
