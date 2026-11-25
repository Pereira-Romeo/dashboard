import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { Header } from "../components/ui/Header";
import { WidgetPicker } from "../components/ui/WidgetPicker";
import { DraggableWidget, MIN_HEIGHT, MIN_WIDTH } from "../components/ui/draggableWidget/DraggableWidget";
import { useSession } from "../context/SessionContext";
import { getAvatarUrl, profileRequest } from "../api/api";
import { ApiError, getErrorMessage } from "../api/client";
import { dashboardWidgetsRequest, saveDashboardWidgetsRequest, type SavedWidget } from "../api/dashboard.ts";
import defaultAvatar from "../assets/defaultPP.jpg";

type ActiveWidget = {
  id: string;
  instanceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  settings: Record<string, string>;
};

const DEFAULT_WIDGET = { x: 50, y: 100, width: MIN_WIDTH, height: MIN_HEIGHT };
const SAVE_DELAY_MS = 800;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function fromSaved(widget: SavedWidget): ActiveWidget {
  const { params, ...rest } = widget;
  return { ...rest, settings: params ?? {} };
}

function toSaved(widget: ActiveWidget): SavedWidget {
  return {
    id: widget.id,
    instanceId: widget.instanceId,
    x: Math.round(widget.x),
    y: Math.round(widget.y),
    width: Math.round(widget.width),
    height: Math.round(widget.height),
    params: widget.settings,
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useSession();
  const [showPicker, setShowPicker] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<ActiveWidget[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>(defaultAvatar);

  const canvasRef = useRef<HTMLDivElement>(null);
  const latestWidgets = useRef(activeWidgets);
  const skipNextSave = useRef(false);
  const unsaved = useRef(false);

  latestWidgets.current = activeWidgets;

  function handleError(err: unknown, fallback: string) {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      return;
    }
    setError(getErrorMessage(err, fallback));
  }

  function save() {
    unsaved.current = false;
    saveDashboardWidgetsRequest(latestWidgets.current.map(toSaved))
      .then(() => setError(null))
      .catch((err) => handleError(err, "Unable to save the dashboard"));
  }

  useEffect(() => {
    let cancelled = false;

    profileRequest()
      .then((profile) => {
        const url = getAvatarUrl(profile.avatar);
        if (!cancelled && url) setAvatar(url);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) logout();
      });

    dashboardWidgetsRequest()
      .then((widgets) => {
        if (cancelled) return;
        skipNextSave.current = true;
        setActiveWidgets(widgets.map(fromSaved));
        setLoaded(true);
      })
      .catch((err) => {
        if (!cancelled) handleError(err, "Unable to load the dashboard");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    unsaved.current = true;
    const id = setTimeout(save, SAVE_DELAY_MS);
    return () => clearTimeout(id);
  }, [activeWidgets, loaded]);

  useEffect(() => {
    return () => {
      if (!unsaved.current) return;
      saveDashboardWidgetsRequest(latestWidgets.current.map(toSaved)).catch(() => {});
    };
  }, []);

  function updateWidget(
    instanceId: string,
    change: (widget: ActiveWidget) => Partial<ActiveWidget>
  ) {
    setActiveWidgets((prev) =>
      prev.map((w) => (w.instanceId === instanceId ? { ...w, ...change(w) } : w))
    );
  }

  function handleAddWidget(widgetId: string, settings: Record<string, string>) {
    setActiveWidgets((prev) => [
      ...prev,
      { id: widgetId, instanceId: crypto.randomUUID(), ...DEFAULT_WIDGET, settings },
    ]);
  }

  function handleDelete(instanceId: string) {
    setActiveWidgets((prev) => prev.filter((w) => w.instanceId !== instanceId));
  }

  function handleDragEnd({ active, delta }: DragEndEvent) {
    updateWidget(String(active.id), (w) => ({
      x: w.x + delta.x,
      y: w.y + delta.y,
    }));
  }

  function handleResize(instanceId: string, width: number, height: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    updateWidget(instanceId, (w) => ({
      width: clamp(width, MIN_WIDTH, canvas.clientWidth - w.x),
      height: clamp(height, MIN_HEIGHT, canvas.clientHeight - w.y),
    }));
  }

  function handleSettingsChange(instanceId: string, settings: Record<string, string>) {
    updateWidget(instanceId, () => ({ settings }));
  }

  return (
    <>
      <Header
        buttons={[
          { label: "New widget", onClick: () => setShowPicker(true) },
          { icon: avatar, onClick: () => navigate("/profile") },
        ]}
      />

      <div className="page">
        {error && (
          <p className="page-error" role="alert">
            {error}
          </p>
        )}

        <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <div className="widget-canvas" ref={canvasRef}>
            {activeWidgets.map((w) => (
              <DraggableWidget
                key={w.instanceId}
                instanceId={w.instanceId}
                widgetId={w.id}
                x={w.x}
                y={w.y}
                width={w.width}
                height={w.height}
                settings={w.settings}
                onResize={handleResize}
                onDelete={handleDelete}
                onSettingsChange={handleSettingsChange}
              />
            ))}
          </div>
        </DndContext>

        <WidgetPicker
          isOpen={showPicker && loaded}
          onClose={() => setShowPicker(false)}
          onSelect={handleAddWidget}
        />
      </div>
    </>
  );
}
