import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

export const widget: WidgetDefinition = {
  name: "current_temp",
  description: "Current temperature information (max, min, current, feels_like...) for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current } = await getWeatherData(lat, lon);

    return {
      temp: current.main.temp,
      max: current.main.temp_max,
      min: current.main.temp_min,
      feels_like: current.main.feels_like,
    };
  },
};

//response scheme for the docs
const currentTempResponseSchema = z
    .object({
	temp: z.number().openapi({ example: 15.9 }),
        max: z.number().openapi({ example: 16.1 }),
        min: z.number().openapi({ example: 15.37 }),
        feels_like: z.number().openapi({ example: 15.97 }),
    })
    .openapi("CurrentTempOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_temp",
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
      description: "Current temperature information (max, min, current, feels_like...) for a location.",
      content: { "application/json": { schema: currentTempResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

