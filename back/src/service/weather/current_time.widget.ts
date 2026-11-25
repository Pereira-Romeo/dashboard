import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

const currentTimeResponseSchema = z
  .object({
    date: z.number().openapi({ description: "Current time, unix seconds", example: 1758800000 }),
    info_time: z.number().openapi({ description: "Time the weather data was actually fetched from the provider, unix seconds", example: 1758799800 }),
    timezone: z.number().openapi({ description: "Shift in seconds from UTC", example: 7200 }),
  })
  .openapi("CurrentTimeOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_time",
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
      description: "Current time, last-fetched time, and timezone offset for a location",
      content: { "application/json": { schema: currentTimeResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

export const widget: WidgetDefinition = {
  name: "current_time",
  description: "Current time, last-fetched time, and timezone offset for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current, fetchedAt } = await getWeatherData(lat, lon);

    return {
      date: Math.floor(Date.now() / 1000),
      info_time: Math.floor(fetchedAt / 1000),
      timezone: current.timezone,
    };
  },
};

