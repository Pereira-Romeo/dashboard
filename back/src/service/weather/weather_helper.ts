import { HttpError } from "../../error";
import type { WeatherData } from "./types";
import { reserveApiCalls } from "../../auth/quota";

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) throw new Error("OPENWEATHER_API_KEY is not set");

const CACHE_TTL_MS = (Number(process.env.WEATHER_CACHE_MINUTES) || 10) * 60_000;
const DAILY_LIMIT = Number(process.env.OPENWEATHER_DAILY_LIMIT) || 950;

interface CacheEntry {
  timestamp: number;
  data: WeatherData;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

//get info from open weather's api
async function fetchOpenWeather(path: string, lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/${path}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 429) {
      throw new HttpError(503, "Weather provider rate limit reached, try again later.");
    }
    throw new HttpError(502, `Weather provider error (${res.status}).`);
  }

  return res.json();
}

//make sure given coords are plausible
export function validateCoords(params: Record<string, unknown>): { lat: number; lon: number } {
  const lat = Number(params.lat);
  const lon = Number(params.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new HttpError(400, "lat and lon must be valid numbers.");
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new HttpError(400, "lat must be between -90 and 90, lon between -180 and 180.");
  }

  return { lat, lon };
}

//get all weather data
//serves every widget of the weather service.
export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const key = cacheKey(lat, lon);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  await reserveApiCalls("openweather", 2, DAILY_LIMIT);

  const [current, forecast] = await Promise.all([
    fetchOpenWeather("weather", lat, lon),
    fetchOpenWeather("forecast", lat, lon),
  ]);

  const data: WeatherData = { current, forecast, fetchedAt: Date.now() };
  cache.set(key, { timestamp: Date.now(), data });

  return data;
}

