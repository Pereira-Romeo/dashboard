import { Router } from "express";
import { HttpError } from "../error";
import { db } from "../db/index";
import { users } from "../db/schema"
import { eq } from 'drizzle-orm';
import { verifyPassword } from "../auth/password";
import { docsRegistry } from "../openapi/registry";
import { loginSchema, type LoginInput } from "../schema/user";
import { validateBody } from "../db/bodySchemasValidation";
import { signToken } from "../auth/jwt";

docsRegistry.registerPath({
    method: "post",
    path: "/login",
    tags: ["Auth"], 
    request: {
	body : {content: {"application/json": {schema: loginSchema}}}
    },
    responses: {
	200: {description: "Login successful."},
	400: {description: "Validation error."},
    403: {description: "User email is unverified"},
	409: {description: "Invalid email or password."},
    },
});

const router = Router();

router.post("/", validateBody(loginSchema), async (_req, res) => {
    const { email, password } = _req.body as LoginInput;

    console.log("bruh");
    const [user] = await db.select({id: users.id, name: users.name, email: users.email, password: users.password, emailVerified: users.emailVerified}).from(users).where(eq(users.email, email));

    if (!user || !await verifyPassword(password, user.password))
	throw new HttpError(401, "Bad credentials.");

    if (!user.emailVerified) {
        throw new HttpError(403, "Please verify your email before logging in.");
    }

    const token = signToken({userId: user.id, email: user.email});
    res.json({ name: user.name, token });
});

export default router;

