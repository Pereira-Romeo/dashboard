import { Router } from "express";
import { HttpError } from "../error";
import { db } from "../db/index";
import { users } from "../db/schema"
import { eq } from 'drizzle-orm';
import { hashPassword } from "../auth/password";
import { validateBody } from "../db/bodySchemasValidation";
import { loginSchema, type LoginInput } from "../schema/user";
import { docsRegistry } from "../openapi/registry";
import crypto from 'crypto';
import { sendVerificationEmail } from "../mail/mailer";

docsRegistry.registerPath({
    method: "post",
    path: "/sign_up",
    tags: ["Auth"], 
    request: {
	body : {content: {"application/json": {schema: loginSchema}}}
    },
    responses: {
	201: {description: "User created."},
	400: {description: "Validation error."},
	409: {description: "Email already in use."},
    },
});

const router = Router();

router.post("/", validateBody(loginSchema), async (_req, res) => {
    const { email, password } = _req.body as LoginInput;

    const [user] = await db.select({email: users.email}).from(users).where(eq(users.email, email));

    if (user)
	throw new HttpError(409, "Email already in use.");

    const hashedPass = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(users).values({
        email,
        password: hashedPass,
        verificationToken,
        verificationTokenExpires,
        verificationLastSentAt: new Date(),
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "Account created. Check your email to verify your account." });
});

export default router;

