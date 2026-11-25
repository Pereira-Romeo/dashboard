import { humidityRequest } from "../../../../../api/weather";
import { WeatherWidget, type CityProps } from "./WeatherWidget";

export function HumidityWidget({ city }: CityProps) {
  return (
    <WeatherWidget city={city} request={humidityRequest}>
      {({ humidity }, { place }) => (
        <>
          <strong className="weather-value">{humidity}%</strong>
          <div className="weather-label">Humidity in {place}</div>

          <div className="weather-bar">
            <div className="weather-bar-fill" style={{ width: `${humidity}%` }} />
          </div>
        </>
      )}
    </WeatherWidget>
  );
}
