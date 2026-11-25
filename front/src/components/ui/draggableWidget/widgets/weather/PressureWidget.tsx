import { pressureRequest } from "../../../../../api/weather";
import { WeatherWidget, type CityProps } from "./WeatherWidget";

export function PressureWidget({ city }: CityProps) {
  return (
    <WeatherWidget city={city} request={pressureRequest}>
      {(data, { place }) => (
        <>
          <div className="weather-main">
            <strong className="weather-value weather-value--md">{data.pressure}</strong>
            <span className="weather-unit">hPa</span>
          </div>

          <div className="weather-label">Pressure in {place}</div>

          {(data.sea_level !== undefined || data.grnd_level !== undefined) && (
            <div className="weather-details">
              {data.sea_level !== undefined && <span>Sea: {data.sea_level} hPa</span>}
              {data.grnd_level !== undefined && (
                <span>Ground: {data.grnd_level} hPa</span>
              )}
            </div>
          )}
        </>
      )}
    </WeatherWidget>
  );
}
