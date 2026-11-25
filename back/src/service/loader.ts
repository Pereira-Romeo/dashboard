//the loader registers each services and widgets to the /about.json route on start-up
//

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { WidgetDefinition } from "../types/widget.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ServiceEntry {
    name: string;
    widgets: WidgetDefinition[];
}

export async function loadServices(): Promise<ServiceEntry[]> {
    const services: ServiceEntry[] = [];

    const serviceDirs = fs
	.readdirSync(__dirname, { withFileTypes: true })
	.filter((d) => d.isDirectory());

    for (const dir of serviceDirs) {
	const serviceDir = path.join(__dirname, dir.name);
	const widgetFiles = fs
	    .readdirSync(serviceDir)
	    .filter((f) => /\.widget\.(ts|js)$/.test(f));

	const widgets: WidgetDefinition[] = [];
	for (const file of widgetFiles) {
	    const mod = await import(path.join(serviceDir, file));
	    if (mod.widget) widgets.push(mod.widget as WidgetDefinition);
	}

	if (widgets.length > 0) services.push({ name: dir.name, widgets });
    }

    return services;
}

