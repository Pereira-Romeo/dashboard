import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { users } from "../../db/schema";
import { HttpError } from "../../error";
import { docsRegistry } from "../../openapi/registry";

docsRegistry.registerPath({
  method: "get",
  path: "/auth/verify-email",
  tags: ["Auth"],
  request: { query: z.object({ token: z.string() }) },
  responses: {
    302: { description: "Redirects to the frontend once verified" },
    400: { description: "Invalid or expired verification token" },
  },
});

const router = Router();

router.get("/", async (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) throw new HttpError(400, "Missing verification token.");

  const [user] = await db
    .select({ id: users.id, verificationTokenExpires: users.verificationTokenExpires })
    .from(users)
    .where(eq(users.verificationToken, token));

  if (!user || !user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
    throw new HttpError(400, "Invalid or expired verification token.");
  }

  await db.update(users)
    .set({ emailVerified: 1, verificationToken: null, verificationTokenExpires: null })
    .where(eq(users.id, user.id));

  res.redirect(`${process.env.CORS_ORIGIN}/login?verified=true`);
});

export default router;

