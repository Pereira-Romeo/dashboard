import { skyRequest } from "../../../../../api/weather";
import { WeatherWidget, type CityProps } from "./WeatherWidget";

const MAIN_LABELS: Record<string, string> = {
  Clear: "Clear sky",
  Clouds: "Cloudy",
  Squall: "Squalls",
};

export function SkyWidget({ city }: CityProps) {
  return (
    <WeatherWidget city={city} request={skyRequest}>
      {(data, { place }) => {
        const condition = data.weather[0];
        const label = condition
          ? MAIN_LABELS[condition.main] ?? condition.main
          : "Unknown";

        return (
          <>
            {condition && (
              <img
                className="sky-icon"
                src={`https://openweathermap.org/img/wn/${condition.icon}@2x.png`}
                alt={label}
              />
            )}
            <strong className="weather-value weather-value--xs">{label}</strong>
            <div className="weather-label">Sky in {place}</div>

            <div className="weather-details">
              <span>Clouds: {data.clouds.all}%</span>
              {data.rain && <span>Rain: {data.rain["1h"]} mm/h</span>}
              {data.snow && <span>Snow: {data.snow["1h"]} mm/h</span>}
            </div>
          </>
        );
      }}
    </WeatherWidget>
  );
}
