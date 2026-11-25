import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

const currentLocResponseSchema = z
  .object({
    coord: z.object({
      lat: z.number().openapi({ example: 48.112 }),
      lon: z.number().openapi({ example: -1.679 }),
    }),
    city: z.string().openapi({ description: "Nearest city name reported by the provider", example: "Paris" }),
  })
  .openapi("CurrentLocOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_loc",
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
      description: "Coordinates and nearest city name for a location",
      content: { "application/json": { schema: currentLocResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

export const widget: WidgetDefinition = {
  name: "current_loc",
  description: "Coordinates and nearest city name for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current } = await getWeatherData(lat, lon);

    return {
      coord: current.coord,
      city: current.name,
    };
  },
};

