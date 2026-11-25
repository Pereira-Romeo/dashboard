import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

const currentPressureResponseSchema = z
  .object({
    pressure: z.number().openapi({ description: "Atmospheric pressure at sea level (or ground level if no sea_level data), hPa", example: 1018 }),
    sea_level: z.number().optional().openapi({ description: "Atmospheric pressure at sea level, hPa", example: 1019 }),
    grnd_level: z.number().optional().openapi({ description: "Atmospheric pressure at ground level, hPa", example: 1015 }),
  })
  .openapi("CurrentPressureOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_pressure",
  tags: ["Weather"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      lat: z.string().openapi({ example: "48.112" }),
      lon: z.string().openapi({ example: "-1.679" }),
    }),
  },
  responses: {
    200: {
      description: "Current atmospheric pressure (standard, sea level, ground level) for a location",
      content: { "application/json": { schema: currentPressureResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

export const widget: WidgetDefinition = {
  name: "current_pressure",
  description: "Current atmospheric pressure (standard, sea level, ground level) for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current } = await getWeatherData(lat, lon);

    return {
      pressure: current.main.pressure,
      sea_level: current.main.sea_level,
      grnd_level: current.main.grnd_level,
    };
  },
};

