import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getErrorMessage } from "../../../../api/client";
import "./Shared.css";

export const RefreshContext = createContext(0);

export function useRefreshTick() {
  return useContext(RefreshContext);
}

export function useWidgetData<T>(request: () => Promise<T>) {
  const refreshTick = useRefreshTick();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    request()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Unable to load the widget"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [request, refreshTick]);

  return { data, error, loading };
}

export function WidgetState({ error = false, children }: { error?: boolean; children: ReactNode }) {
  return (
    <div className={error ? "widget-state error" : "widget-state"} role={error ? "alert" : undefined}>
      {children}
    </div>
  );
}
