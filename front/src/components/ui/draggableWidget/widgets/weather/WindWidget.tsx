import { windRequest } from "../../../../../api/weather";
import { WeatherWidget, type CityProps } from "./WeatherWidget";

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function degToCardinal(deg: number) {
  return DIRECTIONS[Math.round(deg / 45) % 8];
}

function toKmh(metersPerSecond: number) {
  return Math.round(metersPerSecond * 3.6);
}

export function WindWidget({ city }: CityProps) {
  return (
    <WeatherWidget city={city} request={windRequest}>
      {(data, { place }) => (
        <>
          <div className="wind-main">
            <div
              className="wind-arrow"
              style={{ transform: `rotate(${data.deg + 180}deg)` }}
              title={`${data.deg}°`}
            >
              ↑
            </div>
            <div className="weather-main">
              <strong className="weather-value weather-value--md">
                {toKmh(data.speed)}
              </strong>
              <span className="weather-unit">km/h</span>
            </div>
          </div>

          <div className="weather-label">
            Wind in {place} · {degToCardinal(data.deg)} ({data.deg}°)
          </div>

          {data.gust !== undefined && (
            <div className="weather-details">Gusts: {toKmh(data.gust)} km/h</div>
          )}
        </>
      )}
    </WeatherWidget>
  );
}
