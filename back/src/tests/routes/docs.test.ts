import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

describe("API documentation", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("serves an OpenAPI spec that includes the routes registered by route files", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        "/login",
        "/sign_up",
        "/profile",
        "/destroy",
        "/dashboard/widgets",
        "/service/{service}/{widget}",
        "/service/github/github_contributions",
        "/service/github/github_repos",
        "/service/steam/steam_recent_activity",
        "/service/steam/steam_library",
        "/service/weather/current_humidity",
        "/service/weather/current_loc",
        "/service/weather/current_pressure",
        "/service/weather/current_sky",
        "/service/weather/current_sun",
        "/service/weather/current_temp",
        "/service/weather/current_time",
        "/service/weather/current_visibility",
        "/service/weather/current_wind",
        "/service/weather/forecast",
        "/about.json",
        "/auth/github",
        "/auth/github/callback",
        "/auth/resend-verification",
        "/auth/steam",
        "/auth/steam/callback",
        "/auth/verify-email",
      ])
    );
  });

  it("redirects /docs to Scalar", async () => {
    const res = await request(app).get("/docs");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/docs/scalar");
  });

  it.each(["/docs/scalar", "/docs/swagger/"])("serves an HTML page at %s", async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
  });
});

