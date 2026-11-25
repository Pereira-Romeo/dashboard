import { ApiError, request } from "./client";

export type WeatherCondition = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

export type PressureData = {
  pressure: number;
  sea_level?: number;
  grnd_level?: number;
};

export type WindData = {
  speed: number; // m/s
  deg: number;
  gust?: number; // m/s
};

export type VisibilityData = {
  visibility: number; // meters
};

export type SkyData = {
  weather: WeatherCondition[];
  clouds: { all: number };
  rain?: { "1h": number };
  snow?: { "1h": number };
};

export type SunData = {
  sunrise: number; // Unix seconds (UTC)
  sunset: number; // Unix seconds (UTC)
};

export type TempData = {
  temp: number;
  max: number;
  min: number;
  feels_like: number;
};

export type ForecastEntry = {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: WeatherCondition[];
  pop: number;
};

export type ForecastData = {
  cnt: number;
  list: ForecastEntry[];
  city: { name: string; timezone: number };
};

export async function geocodeRequest(city: string) {
  const json = await request<{
    results?: { latitude: number; longitude: number; timezone?: string }[];
  }>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`,
    { auth: false, fallback: "City search failed" }
  );

  const place = json?.results?.[0];
  if (!place) throw new ApiError("City not found", 404);

  return {
    lat: place.latitude,
    lon: place.longitude,
    timezone: place.timezone ?? "UTC",
  };
}

function weatherRequest<T>(endpoint: string, lat: number, lon: number) {
  return request<T>(`/service/weather/${endpoint}?lat=${lat}&lon=${lon}`, {
    errors: { 502: "Weather service unavailable" },
    fallback: "Unable to retrieve weather data",
  });
}

export const humidityRequest = (lat: number, lon: number) =>
  weatherRequest<{ humidity: number }>("current_humidity", lat, lon);

export const pressureRequest = (lat: number, lon: number) =>
  weatherRequest<PressureData>("current_pressure", lat, lon);

export const windRequest = (lat: number, lon: number) =>
  weatherRequest<WindData>("current_wind", lat, lon);

export const visibilityRequest = (lat: number, lon: number) =>
  weatherRequest<VisibilityData>("current_visibility", lat, lon);

export const skyRequest = (lat: number, lon: number) =>
  weatherRequest<SkyData>("current_sky", lat, lon);

export const sunRequest = (lat: number, lon: number) =>
  weatherRequest<SunData>("current_sun", lat, lon);

export const tempRequest = (lat: number, lon: number) =>
  weatherRequest<TempData>("current_temp", lat, lon);

export const forecastRequest = (lat: number, lon: number) =>
  weatherRequest<ForecastData>("forecast", lat, lon);
