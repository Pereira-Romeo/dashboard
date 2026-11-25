// back/src/routes/profile.ts
import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, getAuthUser } from "../auth/auth";
import { uploadAvatar } from "../middleware/upload";
import { HttpError } from "../error";
import { docsRegistry } from "../openapi/registry";
import { profileResponseSchema, updateProfileSchema } from "../schema/user";

docsRegistry.registerPath({
  method: "get",
  path: "/profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current user's profile",
      content: {
        "application/json": { schema: profileResponseSchema },
      },
    },
    401: { description: "Not authenticated" },
  },
});

docsRegistry.registerPath({
  method: "patch",
  path: "/profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            name: z.string().optional(),
            avatar: z.string().optional().openapi({ type: "string", format: "binary" }),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "Profile updated" },
    400: { description: "Validation error or bad file" },
    401: { description: "Not authenticated" },
  },
});

const routerGet = Router();

routerGet.get("/", async (req: Request, res: Response) => {
  const { userId } = getAuthUser(req);

  const [user] = await db
    .select({ name: users.name, email: users.email, avatar: users.avatar })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) throw new HttpError(401, "User does not exist.");

  res.json(user);
});

const routerPatch = Router();

routerPatch.patch("/", uploadAvatar.single("avatar"), async (req: Request, res: Response) => {
  const { userId } = getAuthUser(req);

  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    throw new HttpError(400, result.error.issues.map((i) => i.message).join(", "));
  }
  const { name } = result.data;

  if (!name && !req.file) {
    throw new HttpError(400, "Provide at least a name or an avatar.");
  }

  const updates: Partial<{ name: string; avatar: string }> = {};
  if (name) updates.name = name;
  if (req.file) updates.avatar = `/uploads/avatars/${req.file.filename}`;

  await db.update(users).set(updates).where(eq(users.id, userId));

  res.json({ message: "profile updated" });
});

const router = Router();
router.use(requireAuth);
router.use(routerGet);
router.use(routerPatch);

export default router;

