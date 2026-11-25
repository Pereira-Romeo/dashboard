import { request } from "./client";

export type SavedWidget = {
  id: string;
  instanceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  params: Record<string, string>;
};

export async function dashboardWidgetsRequest(): Promise<SavedWidget[]> {
  const data = await request<{ widgets?: SavedWidget[] }>("/dashboard/widgets", {
    fallback: "Unable to load the dashboard",
  });
  return data?.widgets ?? [];
}

export function saveDashboardWidgetsRequest(widgets: SavedWidget[]) {
  return request<void>("/dashboard/widgets", {
    method: "PUT",
    body: { widgets },
    errors: { 400: "The dashboard could not be saved: invalid widget data" },
    fallback: "Unable to save the dashboard",
  });
}
