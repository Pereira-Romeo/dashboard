import { useEffect, useState } from "react";
import { Button } from "../Button";
import { SelectField } from "../Selectfield";
import { InputField } from "../InputField";
import "./WidgetPicker.css";

type WidgetPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (widgetId: string, settings: Record<string, string>) => void;
};

type WidgetParam = {
  key: string;
  label: string;
  defaultValue: string;
  type: "select" | "text";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

type WidgetDefinition = {
  id: string;
  name: string;
  params: WidgetParam[];
};

const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  { id: "omgg", name: "OMGG", params: [] },
  {
    id: "github",
    name: "GitHub",
    params: [
      {
        key: "data",
        label: "Data to display",
        type: "select",
        defaultValue: "repos",
        options: [
          { value: "repos", label: "Recent repositories" },
          { value: "contributions", label: "Contributions" },
        ],
      },
    ],
  },
  {
    id: "steam",
    name: "Steam",
    params: [
      {
        key: "data",
        label: "Data to display",
        type: "select",
        defaultValue: "library",
        options: [
          { value: "library", label: "Library" },
          { value: "activity", label: "Recent activity" },
        ],
      },
      {
        key: "link",
        label: "On click, open",
        type: "select",
        defaultValue: "library",
        options: [
          { value: "library", label: "My library (Steam client)" },
          { value: "store", label: "Store page" },
          { value: "run", label: "Launch the game" },
        ],
      },
    ],
  },
  {
    id: "weather",
    name: "Weather",
    params: [
      {
        key: "city",
        label: "City",
        type: "text",
        defaultValue: "Paris",
        placeholder: "E.g. Paris",
      },
      {
        key: "data",
        label: "Data to display",
        type: "select",
        defaultValue: "weather",
        options: [
          { value: "weather", label: "Conditions" },
          { value: "temperature", label: "Temperature" },
          { value: "humidity", label: "Humidity" },
          { value: "windSpeed", label: "Wind speed" },
          { value: "airPressure", label: "Air pressure" },
          { value: "visibility", label: "Visibility" },
          { value: "sunDuration", label: "Daylight duration" },
          { value: "forecast", label: "Forecast" },
        ],
      },
    ],
  },
];

export function WidgetPicker({ isOpen, onClose, onSelect }: WidgetPickerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setExpandedId(null);
    setValues({});
    setError(null);
    onClose();
  }

  useEffect(() => {
    if (!isOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  function getValue(widgetId: string, param: WidgetParam) {
    return values[widgetId]?.[param.key] ?? param.defaultValue;
  }

  function setValue(widgetId: string, key: string, value: string) {
    setError(null);
    setValues((prev) => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], [key]: value },
    }));
  }

  function toggle(widgetId: string) {
    setError(null);
    setExpandedId((current) => (current === widgetId ? null : widgetId));
  }

  function handleCreate(widget: WidgetDefinition) {
    const settings: Record<string, string> = {};

    for (const param of widget.params) {
      const value = getValue(widget.id, param).trim();
      if (!value) {
        setError(`${param.label} is required`);
        return;
      }
      settings[param.key] = value;
    }

    onSelect(widget.id, settings);
    handleClose();
  }

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div
        className="popup-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="widget-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="widget-picker-title">Add a widget</h2>

        <div className="widget-list">
          {AVAILABLE_WIDGETS.map((widget) => {
            const isExpanded = expandedId === widget.id;

            return (
              <div
                key={widget.id}
                className={isExpanded ? "widget-option expanded" : "widget-option"}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => toggle(widget.id)}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(widget.id);
                  }
                }}
              >
                {widget.name}

                {isExpanded && (
                  <div className="widget-details" onClick={(e) => e.stopPropagation()}>
                    {widget.params.map((param) =>
                      param.type === "select" ? (
                        <SelectField
                          key={param.key}
                          label={param.label}
                          value={getValue(widget.id, param)}
                          options={param.options ?? []}
                          onChange={(e) => setValue(widget.id, param.key, e.target.value)}
                        />
                      ) : (
                        <InputField
                          key={param.key}
                          label={param.label}
                          type="text"
                          placeholder={param.placeholder}
                          value={getValue(widget.id, param)}
                          onChange={(e) => setValue(widget.id, param.key, e.target.value)}
                        />
                      )
                    )}

                    {error && (
                      <p className="form-error" role="alert">
                        {error}
                      </p>
                    )}

                    <div className="widget-actions">
                      <Button
                        label="Create"
                        variant="primary"
                        onClick={() => handleCreate(widget)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button className="popup-close" onClick={handleClose} label="Close" variant="primary" />
      </div>
    </div>
  );
}
