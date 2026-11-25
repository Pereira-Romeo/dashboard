import { visibilityRequest } from "../../../../../api/weather";
import { WeatherWidget, type CityProps } from "./WeatherWidget";

const MAX_VISIBILITY = 10000;

function formatVisibility(meters: number) {
  if (meters >= 1000) {
    return { value: (meters / 1000).toFixed(meters % 1000 === 0 ? 0 : 1), unit: "km" };
  }
  return { value: String(Math.round(meters)), unit: "m" };
}

function describeVisibility(meters: number) {
  if (meters >= 10000) return "Excellent";
  if (meters >= 5000) return "Good";
  if (meters >= 2000) return "Moderate";
  if (meters >= 1000) return "Reduced";
  return "Very poor";
}

export function VisibilityWidget({ city }: CityProps) {
  return (
    <WeatherWidget city={city} request={visibilityRequest}>
      {({ visibility }, { place }) => {
        const { value, unit } = formatVisibility(visibility);
        const percent = Math.min((visibility / MAX_VISIBILITY) * 100, 100);

        return (
          <>
            <div className="weather-main">
              <strong className="weather-value">{value}</strong>
              <span className="weather-unit">{unit}</span>
            </div>
            <div className="weather-label">Visibility in {place}</div>
            <div className="weather-details">{describeVisibility(visibility)}</div>
            <div className="weather-bar">
              <div className="weather-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </>
        );
      }}
    </WeatherWidget>
  );
}
