import type { JwtPayload } from "../auth/jwt";
//define what a widget is (used to register widgets automatically)
//

export interface WidgetParam {
    name: string;
    type: "string" | "integer" | "number" | "boolean";
}

export interface WidgetDefinition {
    name: string;
    description: string;
    params: WidgetParam[];
    getData?: (params: Record<string, unknown>, user: JwtPayload) => Promise<unknown> | unknown;
}

