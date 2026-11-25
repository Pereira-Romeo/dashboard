import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

const currentVisibilityResponseSchema = z
  .object({
    visibility: z.number().openapi({ description: "Visibility, meters (max 10000)", example: 10000 }),
  })
  .openapi("CurrentVisibilityOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_visibility",
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
      description: "Current visibility for a location",
      content: { "application/json": { schema: currentVisibilityResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

export const widget: WidgetDefinition = {
  name: "current_visibility",
  description: "Current visibility for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current } = await getWeatherData(lat, lon);

    return { visibility: current.visibility };
  },
};

