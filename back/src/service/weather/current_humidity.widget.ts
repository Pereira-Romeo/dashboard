import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

export const widget: WidgetDefinition = {
  name: "current_humidity",
  description: "Current information about humidity for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current } = await getWeatherData(lat, lon);

    return {
      humidity: current.main.humidity,
    };
  },
};

//response scheme for the docs
const currentHumidityResponseSchema = z
    .object({
	humidity: z.number().openapi({ description: "humidity in %", example: 69 }),
    })
    .openapi("CurrentHumidityOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_humidity",
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
      description: "Current information about humidity for a location",
      content: { "application/json": { schema: currentHumidityResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

