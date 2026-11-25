import { Router } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { users } from "../../db/schema";
import { validateBody } from "../../db/bodySchemasValidation";
import { sendVerificationEmail } from "../../mail/mailer";
import { HttpError } from "../../error";
import { docsRegistry } from "../../openapi/registry";

const resendSchema = z.object({ email: z.email() });

const RESEND_COOLDOWN_MS = 60_000; // 1 minute between sends, per account

const limiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10, // per IP, per window
  standardHeaders: true,
  legacyHeaders: false,
});

docsRegistry.registerPath({
  method: "post",
  path: "/auth/resend-verification",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: resendSchema } } },
  },
  responses: {
    200: { description: "If the account exists and is unverified, a new verification email was sent" },
    429: { description: "Too many requests" },
  },
});

const router = Router();

router.post("/", limiter, validateBody(resendSchema), async (req, res) => {
  const { email } = req.body as z.infer<typeof resendSchema>;
  const GENERIC = { message: "If that account exists and isn't verified yet, a new verification email has been sent." };

  const [user] = await db
    .select({ id: users.id, emailVerified: users.emailVerified, verificationLastSentAt: users.verificationLastSentAt })
    .from(users)
    .where(eq(users.email, email));

  if (!user || user.emailVerified) {
    return res.json(GENERIC); // same response either way — don't confirm or deny existence
  }

  if (user.verificationLastSentAt && Date.now() - user.verificationLastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new HttpError(429, "Please wait a moment before requesting another verification email.");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db
    .update(users)
    .set({ verificationToken, verificationTokenExpires, verificationLastSentAt: new Date() })
    .where(eq(users.id, user.id));

  await sendVerificationEmail(email, verificationToken);

  res.json(GENERIC);
});

export default router;

