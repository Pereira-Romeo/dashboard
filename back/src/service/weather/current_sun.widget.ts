import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

export const widget: WidgetDefinition = {
  name: "current_sun",
  description: "Current information about sunrise and sunset time for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current } = await getWeatherData(lat, lon);

    return {
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
    };
  },
};

//response scheme for the docs
const currentSunResponseSchema = z
    .object({
	sunrise: z.number().openapi({ description: "sunrise time, unix", example: 1790748245 }),
        sunset: z.number().openapi({ description: "sunrise time, unix", example: 1790790560 }),
    })
    .openapi("CurrentSunOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_sun",
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
      description: "Current information about sunrise and sunset time for a location",
      content: { "application/json": { schema: currentSunResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

