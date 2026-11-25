import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const MAX_REFRESH_SECONDS = 3600; // 60 min
export const MIN_REFRESH_SECONDS = 10;

export function clampRefreshSeconds(value: number): number {
  return Number.isFinite(value)
    ? Math.min(Math.max(value, 0), MAX_REFRESH_SECONDS)
    : 0;
}

type Props = {
  x: number;
  y: number;
  currentSeconds: number;
  onSave: (seconds: number) => void;
  onReset: () => void;
  onClose: () => void;
};

export function RefreshSettingsPopover({ x, y, currentSeconds, onSave, onReset, onClose }: Props) {
  const [minutes, setMinutes] = useState(String(Math.floor(currentSeconds / 60)));
  const [seconds, setSeconds] = useState(String(currentSeconds % 60));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const total = clampRefreshSeconds(
    (Number(minutes) || 0) * 60 + (Number(seconds) || 0)
  );
  const effective =
    total > 0 && total < MIN_REFRESH_SECONDS ? MIN_REFRESH_SECONDS : total;

  function handleSave() {
    onSave(effective);
    onClose();
  }

  function handleReset() {
    onReset();
    onClose();
  }

  return createPortal(
    <div
      ref={ref}
      className="refresh-popover"
      style={{ position: "fixed", left: x, top: y, zIndex: 1000 }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="refresh-popover-title">Refresh</div>

      <div className="refresh-popover-fields">
        <label>
          <input
            type="number"
            min={0}
            max={60}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
          min
        </label>
        <label>
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
          />
          s
        </label>
      </div>

      <div className="refresh-popover-hint">
        {effective === 0
          ? "Never refreshed"
          : `Every ${Math.floor(effective / 60)} min ${effective % 60} s`}
        {effective !== total && ` (minimum ${MIN_REFRESH_SECONDS} s)`}
      </div>

      <div className="refresh-popover-actions">
        <button type="button" onClick={handleReset}>
          Default
        </button>
        <button type="button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>,
    document.body
  );
}
