import express from "express";
import cors from "cors";
import { loadRoutes } from "./routes/loader";
import { loadServices } from "./service/loader";
import { errorHandler } from "./error";
import { buildOpenApiSpec } from "./openapi";
import { apiReference } from "@scalar/express-api-reference";
import swaggerUi from "swagger-ui-express";
import path from "path";


export async function createApp() {
    const app = express();
    app.set("trust proxy", 1); // set to trust only the proxy from docker
    app.use(cors({ origin: process.env.CORS_ORIGIN }));
    app.use(express.json());

    const services = await loadServices();
    app.locals.services = services;

    //registers routes AND their docs since docs are done inside their corresponding routes
    console.log("\x1b[36m[APP]\x1b[0m Mounting routes...");
    await loadRoutes(app);

    //serve docs
    const spec = buildOpenApiSpec();
    app.get("/openapi.json", (_req, res) => res.json(spec));
    app.use("/docs/scalar", apiReference({ spec: { url: "/openapi.json" }}));
    app.use("/docs/swagger", swaggerUi.serve, swaggerUi.setup(spec));
    //make /docs redirect to scalar docs by default.
    app.use("/docs", (_req, res) => res.redirect("/docs/scalar"));

    //make user's avatars available
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

    app.use(errorHandler);

    return app;
}

