import "../openapi/registry";
import { z } from "zod";

const paramValueSchema = z.union([z.string().max(200), z.number(), z.boolean()]);

export const widgetInstanceSchema = z
  .object({
    id: z.string().min(1).max(64).openapi({ description: "Widget type", example: "weather" }),
    instanceId: z.string().min(1).max(64).openapi({ description: "Unique id of this placed widget", example: "weather-1a2b" }),
    x: z.int().min(0).openapi({ example: 0 }),
    y: z.int().min(0).openapi({ example: 2 }),
    width: z.int().min(1).openapi({ example: 4 }),
    height: z.int().min(1).openapi({ example: 3 }),
    params: z
      .record(z.string(), paramValueSchema)
      .default({})
      .openapi({ example: { city: "Paris", data: "temperature", refresh: 60 } }),
  })
  .openapi("WidgetInstance");

export const dashboardLayoutSchema = z
  .object({
    widgets: z
      .array(widgetInstanceSchema)
      .max(50)
      .refine((widgets) => new Set(widgets.map((w) => w.instanceId)).size === widgets.length, {
        error: "instanceId values must be unique.",
      }),
  })
  .openapi("DashboardLayout");

export type DashboardLayoutInput = z.infer<typeof dashboardLayoutSchema>;

