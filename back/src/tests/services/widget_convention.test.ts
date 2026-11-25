import { describe, expect, it } from "vitest";
import { loadServices } from "../../service/loader";

describe("widget conventions", () => {
  it("every service has widgets, and every widget is well formed", async () => {
    const services = await loadServices();
    expect(services.length).toBeGreaterThan(0);

    for (const service of services) {
      const names = service.widgets.map((w) => w.name);
      expect(new Set(names).size, `duplicate widget name in ${service.name}`).toBe(names.length);

      for (const widget of service.widgets) {
        expect(widget.name, `${service.name}: widget name`).toMatch(/^[a-z0-9_]+$/);
        expect(widget.description.length, `${widget.name}: description`).toBeGreaterThan(0);
        expect(Array.isArray(widget.params), `${widget.name}: params`).toBe(true);

        for (const param of widget.params) {
          expect(["string", "integer", "number", "boolean"], `${widget.name}.${param.name}`).toContain(param.type);
        }
      }
    }
  });
});
