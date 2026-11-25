import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { validateCoords, getWeatherData } from "./weather_helper";
import { docsRegistry } from "../../openapi/registry";

export const widget: WidgetDefinition = {
  name: "forecast",
  description: "forecast for a location",
  params: [
    { name: "lat", type: "number" },
    { name: "lon", type: "number" },
  ],
  getData: async (params) => {
    const { lat, lon } = validateCoords(params);
    const { forecast } = await getWeatherData(lat, lon);

    return {
        cnt: forecast.cnt,
        list: forecast.list,
        city: forecast.city,
    };
  },
};

//response scheme for the docs
const forecastResponseSchema = z
  .object({
    cnt: z.number().openapi({ description: "Number of forecast entries", example: 40 }),
    list: z.array(
      z.object({
        dt: z.number().openapi({ description: "Time of the forecast, Unix timestamp", example: 1791406800 }),
        main: z
          .object({
            temp: z.number().openapi({ description: "Temperature, Kelvin", example: 13.96 }),
            feels_like: z.number().openapi({ description: "Temperature accounting for human perception, Kelvin", example: 13.55 }),
            temp_min: z.number().openapi({ description: "Minimum temperature, Kelvin", example: 13.96 }),
            temp_max: z.number().openapi({ description: "Maximum temperature, Kelvin", example: 14.17 }),
            pressure: z.number().openapi({ description: "Atmospheric pressure at sea level, hPa", example: 1014 }),
            sea_level: z.number().openapi({ description: "Atmospheric pressure at sea level, hPa", example: 1014 }),
            grnd_level: z.number().openapi({ description: "Atmospheric pressure at ground level, hPa", example: 1010 }),
            humidity: z.number().openapi({ description: "Humidity, %", example: 82 }),
            temp_kf: z.number().openapi({ description: "Internal parameter", example: -0.21 }),
          })
          .openapi("forecastMain"),
        weather: z.array(
          z.object({
            id: z.number().openapi({ example: 803 }),
            main: z.string().openapi({ example: "Clouds" }),
            description: z.string().openapi({ example: "broken clouds" }),
            icon: z.string().openapi({ example: "04n" }),
          })
        ),
        clouds: z
          .object({
            all: z.number().openapi({ description: "Cloudiness, %", example: 75 }),
          })
          .openapi("forecastClouds"),
        wind: z
          .object({
            speed: z.number().openapi({ description: "Wind speed, meter/sec", example: 5.84 }),
            deg: z.number().openapi({ description: "Wind direction, degrees", example: 344 }),
            gust: z.number().openapi({ description: "Wind gust, meter/sec", example: 11.32 }),
          })
          .openapi("forecastWind"),
        visibility: z.number().openapi({ description: "Average visibility, meters", example: 10000 }),
        pop: z.number().openapi({ description: "Probability of precipitation, from 0 to 1", example: 0 }),
        rain: z.object({ "3h": z.number().openapi({ description: "Volume of rain for last 3hours in mm", example: 5 }) }).optional(),
        snow: z.object({ "3h": z.number().openapi({ description: "Volume of snow for last 3hours in mm", example: 5 }) }).optional(),
        sys: z
          .object({
            pod: z.string().openapi({ description: "Part of the day indicator (n = night, d = day)", example: "n" }),
          })
          .openapi("forecastSys"),
        dt_txt: z.string().openapi({ description: "Date and time of the forecast", example: "2026-10-07 21:00:00" }),
      })
    ).openapi({ description: "list of forecast entries" }),
    city: z
      .object({
        id: z.number().openapi({ description: "City ID", example: 6432801 }),
        name: z.string().openapi({ description: "City name", example: "Rennes" }),
        coord: z
          .object({
            lat: z.number().openapi({ description: "Latitude", example: 48.112 }),
            lon: z.number().openapi({ description: "Longitude", example: -1.679 }),
          })
          .openapi("forecastCityCoord"),
        country: z.string().openapi({ description: "Country code", example: "FR" }),
        population: z.number().openapi({ description: "City population", example: 207922 }),
        timezone: z.number().openapi({ description: "Shift in seconds from UTC", example: 7200 }),
        sunrise: z.number().openapi({ description: "Sunrise time, Unix timestamp", example: 1791353637 }),
        sunset: z.number().openapi({ description: "Sunset time, Unix timestamp", example: 1791394498 }),
      })
      .openapi("forecastCity"),
  })
  .openapi("forecastOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/weather/forecast",
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
      content: { "application/json": { schema: forecastResponseSchema } },
    },
    400: { description: "Invalid or missing lat/lon" },
    401: { description: "Not authenticated" },
    429: { description: "Daily API call quota reached" },
    503: { description: "Weather provider rate limit reached" },
  },
});

