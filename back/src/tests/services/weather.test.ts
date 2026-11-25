import { describe, expect, it } from "vitest";
import { loadServices } from "../../service/loader";
import { validateCoords } from "../../service/weather/weather_helper";
import { TEST_USER, thrownStatus } from "../helper";

describe("validateCoords", () => {
  it("parses numeric strings", () => {
    expect(validateCoords({ lat: "48.85", lon: "2.35" })).toEqual({ lat: 48.85, lon: 2.35 });
  });

  const invalid: [string, Record<string, unknown>][] = [
    ["a non-numeric latitude", { lat: "abc", lon: "2" }],
    ["a missing longitude", { lat: "48" }],
    ["a latitude above 90", { lat: "91", lon: "0" }],
    ["a latitude below -90", { lat: "-91", lon: "0" }],
    ["a longitude above 180", { lat: "0", lon: "181" }],
    ["a longitude below -180", { lat: "0", lon: "-181" }],
  ];

  it.each(invalid)("rejects %s with a 400", (_label, params) => {
    expect(thrownStatus(() => validateCoords(params))).toBe(400);
  });
});

describe("weather widgets", () => {
  it("every weather widget rejects invalid coordinates before any network or database call", async () => {
    const services = await loadServices();
    const weather = services.find((s) => s.name === "weather");
    expect(weather).toBeDefined();

    for (const widget of weather!.widgets) {
      if (!widget.getData) continue;
      const call = (params: Record<string, unknown>) =>
        Promise.resolve().then(() => widget.getData!(params, TEST_USER));

      await expect(call({ lat: "abc", lon: "2" })).rejects.toMatchObject({ status: 400 });
      await expect(call({ lat: "95", lon: "2" })).rejects.toMatchObject({ status: 400 });
    }
  });
});
