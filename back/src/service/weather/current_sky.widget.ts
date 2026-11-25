import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

export const widget: WidgetDefinition = {
  name: "current_sky",
  description: "Current sky conditions (weather description, icon, cloud cover) for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { current } = await getWeatherData(lat, lon);

    return {
      weather: current.weather,
      clouds: current.clouds,
      rain: current.rain,
      snow: current.snow,
    };
  },
};

//response scheme for the docs
const currentSkyResponseSchema = z
  .object({
    weather: z.array(
      z.object({
        id: z.number().openapi({ example: 801 }),
        main: z.string().openapi({ example: "Clouds" }),
        description: z.string().openapi({ example: "few clouds" }),
        icon: z.string().openapi({ example: "02d" }),
      })
    ),
    clouds: z.object({
      all: z.number().openapi({ description: "Cloudinness, %", example: 20 }),
    }),
    rain: z.object({
	"1h": z.number().openapi({ description: "precipitation in mm/h", example: 5 })
    }).optional(),
    snow: z.object({
	"1h": z.number().openapi({ description: "precipitation in mm/h", example: 5 })
    }).optional(),
  })
  .openapi("CurrentSkyOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/current_sky",
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
      description: "Current sky conditions (weather description, icon, cloud cover)",
      content: { "application/json": { schema: currentSkyResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

