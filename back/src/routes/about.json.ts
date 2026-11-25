import { Router } from "express";
import type { ServiceEntry } from "../service/loader";
import { docsRegistry } from "../openapi/registry";

const router = Router();

router.get("/", (_req, res) => {
    const services = _req.app.locals.services as ServiceEntry[];
    res.json({
	client: {
	    host: _req.ip
	},
	server: {
	    current_time: Date.now(),
	    services: services.map((service) => ({
		name: service.name,
		widgets: service.widgets.map(({ name, description, params }) => ({
		    name,
		    description,
		    params,
		})),
	    })),
	},
    });
});

export default router;


docsRegistry.registerPath({
    method: "get",
    path: "/about.json",
    description: "Returns information about the client, server, and the services and widgets available on the dashboard.",
    responses: {
        200: {
            description: "Dashboard information",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["client", "server"],
                        properties: {
                            client: {
                                type: "object",
                                required: ["host"],
                                properties: {
                                    host: {
                                        type: "string",
                                        description:
                                            "IP address or hostname of the client making the request.",
                                        example: "192.168.1.42",
                                    },
                                },
                            },
                            server: {
                                type: "object",
                                required: ["current_time", "services"],
                                properties: {
                                    current_time: {
                                        type: "integer",
                                        format: "int64",
                                        description:
                                            "Current server time as a Unix timestamp.",
                                        example: 1710000000,
                                    },
                                    services: {
                                        type: "array",
                                        description:
                                            "Services available on the dashboard.",
                                        items: {
                                            type: "object",
                                            required: ["name", "widgets"],
                                            properties: {
                                                name: {
                                                    type: "string",
                                                    description:
                                                        "Name of the service.",
                                                    example: "example_service",
                                                },
                                                widgets: {
                                                    type: "array",
                                                    description:
                                                        "Widgets provided by the service.",
                                                    items: {
                                                        type: "object",
                                                        required: [
                                                            "name",
                                                            "description",
                                                            "params",
                                                        ],
                                                        properties: {
                                                            name: {
                                                                type: "string",
                                                                description:
                                                                    "Name of the widget.",
                                                                example:
                                                                    "example_widget_1",
                                                            },
                                                            description: {
                                                                type: "string",
                                                                description:
                                                                    "Description of what the widget does.",
                                                                example:
                                                                    "Example of a widget",
                                                            },
                                                            params: {
                                                                type: "array",
                                                                description:
                                                                    "Parameters accepted by the widget.",
                                                                items: {
                                                                    type: "object",
                                                                    required: [
                                                                        "name",
                                                                        "type",
                                                                    ],
                                                                    properties: {
                                                                        name: {
                                                                            type: "string",
                                                                            description:
                                                                                "Name of the parameter.",
                                                                            example:
                                                                                "param_name",
                                                                        },
                                                                        type: {
                                                                            type: "string",
                                                                            description:
                                                                                "Data type expected for the parameter.",
                                                                            example:
                                                                                "string",
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});

