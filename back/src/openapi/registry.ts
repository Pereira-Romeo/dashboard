import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const docsRegistry = new OpenAPIRegistry();

docsRegistry.registerComponent("securitySchemes", "bearerAuther", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

