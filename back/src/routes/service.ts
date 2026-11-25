import { Router } from "express";
import type { ServiceEntry } from "../service/loader";
import { requireAuth } from "../auth/auth";
import { docsRegistry } from "../openapi/registry";
import { z } from "zod";
import { getAuthUser } from "../auth/auth";

const router = Router();

router.use(requireAuth);

router.get("/:service/:widget", async (_req, res) => {
    const services = _req.app.locals.services as ServiceEntry[];
    const service = services.find((s) => s.name === _req.params.service);
    const widget = service?.widgets.find((w) => w.name === _req.params.widget);

    if (!widget) return res.status(404).json({ error: "widget not found" });
    if (!widget.getData) return res.status(501).json({ error: "widget has no data source" });

    const data = await widget.getData(_req.query as Record<string, unknown>, getAuthUser(_req));
    res.json(data);
});


export default router;

docsRegistry.registerPath({
  method: "get",
  path: "/service/{service}/{widget}",
  tags: ["Service"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ service: z.string(), widget: z.string() }),
  },
  responses: {
    200: { description: "Widget data" },
    401: { description: "Missing or invalid authentication" },
    404: { description: "Widget not found" },
    501: { description: "Widget has no data source" },
  },
});

