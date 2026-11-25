import type { ComponentType } from "react";
import { OmggWidget } from "./widgets/OmggWidget";
import { GithubWidget } from "./widgets/github/GithubWidget";
import { GithubContributionsWidget } from "./widgets/github/GithubContributionsWidget";
import { SteamLibWidget } from "./widgets/steam/SteamLibWidget";
import { SteamActivityWidget } from "./widgets/steam/SteamActivityWidget";
import { ForecastWidget } from "./widgets/weather/ForecastWidget";
import { HumidityWidget } from "./widgets/weather/HumidityWidget";
import { PressureWidget } from "./widgets/weather/PressureWidget";
import { SkyWidget } from "./widgets/weather/SkyWidget";
import { SunWidget } from "./widgets/weather/SunWidget";
import { TempWidget } from "./widgets/weather/TempWidget";
import { VisibilityWidget } from "./widgets/weather/VisibilityWidget";
import { WindWidget } from "./widgets/weather/WindWidget";

const WEATHER_WIDGETS: Record<string, ComponentType<{ city: string }>> = {
  humidity: HumidityWidget,
  airPressure: PressureWidget,
  windSpeed: WindWidget,
  visibility: VisibilityWidget,
  sunDuration: SunWidget,
  temperature: TempWidget,
  forecast: ForecastWidget,
};

type WidgetContentProps = {
  widgetId: string;
  settings?: Record<string, string>;
};

export function WidgetContent({ widgetId, settings = {} }: WidgetContentProps) {
  switch (widgetId) {
    case "omgg":
      return <OmggWidget />;

    case "weather": {
      const WeatherWidget = WEATHER_WIDGETS[settings.data] ?? SkyWidget;
      return <WeatherWidget city={settings.city} />;
    }

    case "github":
      return settings.data === "contributions" ? (
        <GithubContributionsWidget />
      ) : (
        <GithubWidget />
      );

    case "steam":
      return settings.data === "library" ? (
        <SteamLibWidget link={settings.link} />
      ) : (
        <SteamActivityWidget link={settings.link} />
      );

    default:
      return (
        <p className="widget-error" role="alert">
          Unknown widget
        </p>
      );
  }
}