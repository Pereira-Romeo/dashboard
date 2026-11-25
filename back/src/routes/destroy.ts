import { Router } from "express";
import { db } from "../db/index";
import { users } from "../db/schema"
import { getAuthUser, requireAuth } from "../auth/auth";
import { eq } from "drizzle-orm";
import { docsRegistry } from "../openapi/registry";
import { HttpError } from "../error";

docsRegistry.registerPath({
  method: "delete",
  path: "/destroy",
  tags: ["Auth"], 
  security: [{ bearerAuth: [] }],
  responses: {
    204: { description: "Permanently delete current user" },
    401: { description: "Not authenticated" },
  },
});

const router = Router();

router.use(requireAuth);

router.delete("/", async (_req, res) => {
    const { userId } = getAuthUser(_req);

    const [result] = await db.delete(users).where(eq(users.id, userId));

    if (result.affectedRows === 0) {
	throw new HttpError(401, "Account does not exist.");
    }

    res.status(204).end();
});


export default router;

