import { sunRequest } from "../../../../../api/weather";
import { WeatherWidget, type CityProps } from "./WeatherWidget";

function formatTime(unixSeconds: number, timeZone: string) {
  return new Date(unixSeconds * 1000).toLocaleTimeString("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

export function SunWidget({ city }: CityProps) {
  return (
    <WeatherWidget city={city} request={sunRequest}>
      {(sun, { place, timezone }) => {
        const dayLength = sun.sunset - sun.sunrise;
        const elapsed = (Date.now() / 1000 - sun.sunrise) / dayLength;
        const progress = Math.min(Math.max(elapsed, 0), 1) * 100;

        return (
          <>
            <strong className="weather-value weather-value--sm">
              {formatDuration(dayLength)}
            </strong>
            <div className="weather-label">Daylight in {place}</div>

            <div className="weather-bar">
              <div className="weather-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="sun-times">
              <span>☀️ {formatTime(sun.sunrise, timezone)}</span>
              <span>🌙 {formatTime(sun.sunset, timezone)}</span>
            </div>
          </>
        );
      }}
    </WeatherWidget>
  );
}
