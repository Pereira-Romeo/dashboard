import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Resizable } from "re-resizable";
import { WidgetContent } from "./WidgetContent";
import { RefreshContext } from "./widgets/Shared";
import { RefreshSettingsPopover, clampRefreshSeconds } from "./RefreshSettingsPopover";
import { getErrorMessage } from "../../../api/client";
import { geocodeRequest } from "../../../api/weather";
import "./DraggableWidget.css";

export const MIN_WIDTH = 240;
export const MIN_HEIGHT = 160;

const WIDGET_NAMES: Record<string, string> = {
  omgg: "OMGG",
  github: "GitHub",
  steam: "Steam",
  weather: "Weather",
};

const DEFAULT_REFRESH_SECONDS: Record<string, number> = {
  weather: 10 * 60,
  github: 60 * 60,
};

const WEATHER_LAYERS: Record<string, string> = {
  weather: "clouds",
  temperature: "temperature",
  humidity: "temperature",
  windSpeed: "wind",
  airPressure: "pressure",
  visibility: "clouds",
  sunDuration: "clouds",
};

type Settings = Record<string, string>;

type DraggableWidgetProps = {
  instanceId: string;
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  settings: Settings;
  onResize: (instanceId: string, width: number, height: number) => void;
  onDelete: (instanceId: string) => void;
  onSettingsChange: (instanceId: string, settings: Settings) => void;
};

function getRefreshSeconds(widgetId: string, settings: Settings): number {
  const raw = settings.refreshSeconds;
  if (raw === undefined || raw === "") return DEFAULT_REFRESH_SECONDS[widgetId] ?? 0;
  return clampRefreshSeconds(Number(raw));
}

async function openWeatherMap(settings: Settings) {
  const win = window.open("", "_blank");
  if (!win) throw new Error("Pop-up blocked");
  win.opener = null;

  try {
    const { lat, lon } = await geocodeRequest(settings.city);
    const layer = WEATHER_LAYERS[settings.data] ?? "temperature";
    win.location.href =
      `https://openweathermap.org/weathermap?basemap=map&cities=true` +
      `&layer=${layer}&lat=${lat}&lon=${lon}&zoom=10`;
  } catch (err) {
    win.close();
    throw err;
  }
}

export function DraggableWidget({ instanceId, widgetId, x, y, width, height, settings, onResize, onDelete, onSettingsChange }: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({id: instanceId,});

  const [refreshTick, setRefreshTick] = useState(0);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSeconds = getRefreshSeconds(widgetId, settings);

  useEffect(() => {
    if (refreshSeconds <= 0) return;

    const id = setInterval(() => {
      if (!document.hidden) setRefreshTick((t) => t + 1);
    }, refreshSeconds * 1000);

    return () => clearInterval(id);
  }, [refreshSeconds]);

  const hasWeatherMap = widgetId === "weather" && !!settings.city;
  const githubUrl =
    widgetId === "github" && settings.username
      ? `https://github.com/${encodeURIComponent(settings.username)}`
      : null;
  const clickable = hasWeatherMap || !!githubUrl;

  function handleClick() {
    setError(null);

    if (hasWeatherMap) {
      openWeatherMap(settings).catch((err) =>
        setError(getErrorMessage(err, "Unable to open the weather map"))
      );
    } else if (githubUrl) {
      window.open(githubUrl, "_blank", "noopener,noreferrer");
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  }

  function saveRefresh(seconds: number) {
    onSettingsChange(instanceId, { ...settings, refreshSeconds: String(seconds) });
  }

  function resetRefresh() {
    const rest = { ...settings };
    delete rest.refreshSeconds;
    onSettingsChange(instanceId, rest);
  }

  return (
    <div
      ref={setNodeRef}
      onContextMenu={handleContextMenu}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
    >
      <Resizable
        size={{ width, height }}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        enable={{ bottomRight: true }}
        handleClasses={{ bottomRight: "widget-resize-handle" }}
        onResize={(_e, _dir, ref) =>
          onResize(instanceId, ref.offsetWidth, ref.offsetHeight)
        }
        className="widget-card"
      >
        <div className="widget-content">
          <div className="widget-header">
            <div className="widget-drag-handle" {...attributes} {...listeners}>
              {WIDGET_NAMES[widgetId] ?? widgetId}
            </div>
            <button
              type="button"
              className="widget-delete-btn"
              onClick={() => onDelete(instanceId)}
              aria-label="Delete widget"
              title="Delete"
            >
              ✕
            </button>
          </div>

          {error && (
            <p className="widget-error" role="alert">
              {error}
            </p>
          )}

          <div
            className={`widget-preview-wrapper${clickable ? " is-clickable" : ""}`}
            onClick={clickable ? handleClick : undefined}
          >
            <RefreshContext.Provider value={refreshTick}>
              <WidgetContent widgetId={widgetId} settings={settings} />
            </RefreshContext.Provider>
          </div>
        </div>
      </Resizable>

      {menu && (
        <RefreshSettingsPopover
          x={menu.x}
          y={menu.y}
          currentSeconds={refreshSeconds}
          onClose={() => setMenu(null)}
          onSave={saveRefresh}
          onReset={resetRefresh}
        />
      )}
    </div>
  );
}
