import { useMemo } from "react";
import { forecastRequest, type ForecastData, type ForecastEntry } from "../../../../../api/weather";
import { WeatherWidget, type CityProps } from "./WeatherWidget";

type DaySummary = {
  key: string;
  label: string;
  icon: string;
  description: string;
  min: number;
  max: number;
  pop: number;
};

function localDate(unixSeconds: number, timezoneOffset: number) {
  return new Date((unixSeconds + timezoneOffset) * 1000);
}

function summarize(list: ForecastEntry[], timezoneOffset: number): DaySummary[] {
  const days = new Map<string, ForecastEntry[]>();

  for (const entry of list) {
    const key = localDate(entry.dt, timezoneOffset).toISOString().slice(0, 10);
    const entries = days.get(key) ?? [];
    entries.push(entry);
    days.set(key, entries);
  }

  const distanceToNoon = (entry: ForecastEntry) =>
    Math.abs(localDate(entry.dt, timezoneOffset).getUTCHours() - 12);

  return Array.from(days.entries()).map(([key, entries], index) => {
    const midday = entries.reduce((best, e) =>
      distanceToNoon(e) < distanceToNoon(best) ? e : best
    );
    const condition = midday.weather[0];

    return {
      key,
      label:
        index === 0
          ? "Today"
          : new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              timeZone: "UTC",
            }),
      icon: condition ? condition.icon.replace("n", "d") : "",
      description: condition?.description ?? "",
      min: Math.min(...entries.map((e) => e.main.temp_min)),
      max: Math.max(...entries.map((e) => e.main.temp_max)),
      pop: Math.max(...entries.map((e) => e.pop)),
    };
  });
}

function ForecastDays({ data, place }: { data: ForecastData; place: string }) {
  const days = useMemo(() => summarize(data.list, data.city.timezone), [data]);

  if (days.length === 0) {
    return <div className="weather-widget-state">No forecast</div>;
  }

  return (
    <>
      <div className="forecast-title">Forecast in {place}</div>
      <ul className="forecast-list">
        {days.map((day) => (
          <li key={day.key} className="forecast-day">
            <span className="forecast-day-label">{day.label}</span>

            {day.icon && (
              <img
                className="forecast-icon"
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt={day.description}
                title={day.description}
                loading="lazy"
              />
            )}

            <span className="forecast-pop" title="Chance of precipitation">
              {Math.round(day.pop * 100)}%
            </span>

            <span className="forecast-temps">
              <strong>{Math.round(day.max)}°</strong>
              <span className="forecast-min">{Math.round(day.min)}°</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ForecastWidget({ city }: CityProps) {
  return (
    <WeatherWidget className="forecast-widget" city={city} request={forecastRequest}>
      {(data, { place }) => <ForecastDays data={data} place={place} />}
    </WeatherWidget>
  );
}
