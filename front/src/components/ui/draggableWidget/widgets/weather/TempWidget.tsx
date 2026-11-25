import { tempRequest } from "../../../../../api/weather";
import { WeatherWidget, type CityProps } from "./WeatherWidget";

export function TempWidget({ city }: CityProps) {
  return (
    <WeatherWidget city={city} request={tempRequest}>
      {(data, { place }) => (
        <>
          <strong className="weather-value weather-value--lg">
            {Math.round(data.temp)}°C
          </strong>
          <div className="weather-label">Temperature in {place}</div>

          <div className="weather-details">
            <span>Feels like: {Math.round(data.feels_like)}°C</span>
            <span>
              Min {Math.round(data.min)}° · Max {Math.round(data.max)}°
            </span>
          </div>
        </>
      )}
    </WeatherWidget>
  );
}
