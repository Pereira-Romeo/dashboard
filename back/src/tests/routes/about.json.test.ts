import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { getTestApp } from "../helper";

interface ServiceInfo {
  name: string;
  widgets: { name: string; description: string; params: { name: string; type: string }[] }[];
}

describe("GET /about.json", () => {
  let app: Express;

  beforeAll(async () => {
    app = await getTestApp();
  });

  async function fetchServices(): Promise<ServiceInfo[]> {
    const res = await request(app).get("/about.json");
    expect(res.status).toBe(200);
    expect(res.body.server?.services, "expected the services list at body.server.services").toBeDefined();
    return res.body.server.services as ServiceInfo[];
  }

  it("lists the services discovered on disk", async () => {
    const services = await fetchServices();
    expect(services.map((s) => s.name)).toEqual(expect.arrayContaining(["weather", "github", "steam"]));
  });

  it("exposes exactly name, description and params for each widget", async () => {
    const services = await fetchServices();

    for (const service of services) {
      expect(service.widgets.length).toBeGreaterThan(0);
      for (const widget of service.widgets) {
        expect(widget).toEqual({
          name: expect.any(String),
          description: expect.any(String),
          params: expect.any(Array),
        });
      }
    }
  });
});
