import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { docsRegistry } from "./openapi/registry";

export function buildOpenApiSpec() {
    const generator = new OpenApiGeneratorV3(docsRegistry.definitions);
    return generator.generateDocument({
	openapi: "3.0.0",
	info: { title: "Dashboard API", version: "1.0.0" },
	tags: [
	    {
		name: "Auth",
		description: "Route used to create, authenticate or destroy a user"
	    },
	    {
		name: "Service",
		description: "Route that is fed information by a service.",
	    },
	    {
		name: "Weather",
		description: "Route that is fed information by the weather service.",
		parent: "Service",
		externalDocs: { description: "openWeather API doc", url: "https://openweathermap.org/api/current?collection=current_forecast"}
	    },
        {
            name: "GitHub",
            description: "Route that is fed information by the github service.",
            parent: "Service"
        },
        {
            name: "Steam",
            description: "Route that is fed information by the steam service.",
            parent: "Service"
        }
	],
    });
}

