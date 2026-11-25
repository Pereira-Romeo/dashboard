import { Router } from "express";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { userWidgets } from "../../db/schema";
import { requireAuth } from "../../auth/auth";
import { getAuthUser } from "../../auth/auth";
import { validateBody } from "../../db/bodySchemasValidation";
import { dashboardLayoutSchema, type DashboardLayoutInput } from "../../schema/dashboard";
import { docsRegistry } from "../../openapi/registry";

docsRegistry.registerPath({
  method: "get",
  path: "/dashboard/widgets",
  tags: ["Dashboard"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "The current user's saved widget layout",
      content: { "application/json": { schema: dashboardLayoutSchema } },
    },
    401: { description: "Not authenticated" },
  },
});

docsRegistry.registerPath({
  method: "put",
  path: "/dashboard/widgets",
  tags: ["Dashboard"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: dashboardLayoutSchema } } },
  },
  responses: {
    204: { description: "Layout saved (replaces the previous one)" },
    400: { description: "Validation error" },
    401: { description: "Not authenticated" },
  },
});

const routerGet = Router();

routerGet.get("/", async (req: Request, res: Response) => {
  const { userId } = getAuthUser(req);

  const rows = await db
    .select()
    .from(userWidgets)
    .where(eq(userWidgets.userId, userId))
    .orderBy(userWidgets.id);

  const widgets = rows.map((r) => ({
    id: r.widgetId,
    instanceId: r.instanceId,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    params: r.params,
  }));

  res.json({ widgets });
});

const routerPut = Router();

routerPut.put("/", validateBody(dashboardLayoutSchema), async (req: Request, res: Response) => {
  const { userId } = getAuthUser(req);
  const { widgets } = req.body as DashboardLayoutInput;

  await db.transaction(async (tx) => {
    await tx.delete(userWidgets).where(eq(userWidgets.userId, userId));

    if (widgets.length > 0) {
      await tx.insert(userWidgets).values(
        widgets.map((w) => ({
          userId,
          widgetId: w.id,
          instanceId: w.instanceId,
          x: w.x,
          y: w.y,
          width: w.width,
          height: w.height,
          params: w.params,
        }))
      );
    }
  });

  res.status(204).end();
});

const router = Router();
router.use(requireAuth);
router.use(routerGet);
router.use(routerPut);

export default router;
