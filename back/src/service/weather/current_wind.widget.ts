import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

export const widget: WidgetDefinition = {
  name: "current_wind",
  description: "Current wind speed, direction, and gust for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current } = await getWeatherData(lat, lon);

    return current.wind;
  },
};

const currentWindResponseSchema = z
  .object({
    speed: z.number().openapi({ description: "Wind speed, meter/sec", example: 4.6 }),
    deg: z.number().openapi({ description: "Wind direction, degrees (meteorological)", example: 250 }),
    gust: z.number().optional().openapi({ description: "Wind gust, meter/sec", example: 7.2 }),
  })
  .openapi("CurrentWindOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_wind",
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
      description: "Current wind speed, direction, and gust for a location",
      content: { "application/json": { schema: currentWindResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

