import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getErrorMessage } from "../../../../../api/client";
import { geocodeRequest } from "../../../../../api/weather";
import { useRefreshTick } from "../Shared";
import "./WeatherWidget.css";

const DEFAULT_CITY = "Paris";
const SEARCH_ERROR_DURATION_MS = 3000;

export type CityProps = {
  city?: string;
};

type WeatherRequest<T> = (lat: number, lon: number) => Promise<T>;

type WeatherResult<T> = {
  data: T;
  timezone: string;
};

async function fetchWeather<T>(
  city: string,
  request: WeatherRequest<T>
): Promise<WeatherResult<T>> {
  const { lat, lon, timezone } = await geocodeRequest(city);
  return { data: await request(lat, lon), timezone };
}

function useCityWeather<T>(city: string, request: WeatherRequest<T>) {
  const [place, setPlace] = useState(city);
  const [input, setInput] = useState(city);
  const [result, setResult] = useState<WeatherResult<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setPlace(city);
    setInput(city);

    fetchWeather(city, request)
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setResult(null);
        setError(getErrorMessage(err, "Unable to retrieve weather data"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city, request]);

  const refreshTick = useRefreshTick();
  const lastTick = useRef(refreshTick);

  useEffect(() => {
    if (refreshTick === lastTick.current) return;
    lastTick.current = refreshTick;

    let cancelled = false;

    fetchWeather(place, request)
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        setError(null);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [refreshTick, place, request]);

  useEffect(() => {
    if (!searchError) return;
    const id = setTimeout(() => setSearchError(null), SEARCH_ERROR_DURATION_MS);
    return () => clearTimeout(id);
  }, [searchError]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const newCity = input.trim();
    if (!newCity || newCity === place || searching) {
      setInput(place);
      return;
    }

    setSearching(true);
    setSearchError(null);
    try {
      setResult(await fetchWeather(newCity, request));
      setError(null);
      setPlace(newCity);
    } catch (err) {
      setInput(place);
      const reason = getErrorMessage(err, "Search failed");
      setSearchError(`${reason}, back to ${place}`);
    } finally {
      setSearching(false);
    }
  }

  return { place, input, setInput, result, error, searchError, loading, searching, submit };
}

type WeatherWidgetProps<T> = CityProps & {
  request: WeatherRequest<T>;
  className?: string;
  children: (data: T, info: { place: string; timezone: string }) => ReactNode;
};

export function WeatherWidget<T>({ city = DEFAULT_CITY, request, className, children }: WeatherWidgetProps<T>) {
  const { place, input, setInput, result, error, searchError, loading, searching, submit } =
    useCityWeather(city, request);

  let content: ReactNode;
  if (loading) {
    content = <div className="weather-widget-state">Loading…</div>;
  } else if (error) {
    content = (
      <div className="weather-widget-state error" role="alert">
        {error}
      </div>
    );
  } else if (!result) {
    content = <div className="weather-widget-state">No data</div>;
  } else {
    content = (
      <div className="weather-content">
        {children(result.data, { place, timezone: result.timezone })}
      </div>
    );
  }

  return (
    <div className={className ? `weather-widget ${className}` : "weather-widget"}>
      <form
        className="weather-search"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          className="weather-search-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="City…"
          aria-label="Change city"
          disabled={searching}
        />
        <button
          className="weather-search-btn"
          type="submit"
          disabled={searching}
          aria-label="Search"
        >
          {searching ? "…" : "↵"}
        </button>
      </form>

      {searchError && (
        <div className="weather-search-error" role="alert">
          {searchError}
        </div>
      )}

      {content}
    </div>
  );
}
