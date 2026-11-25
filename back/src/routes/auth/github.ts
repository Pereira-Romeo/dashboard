import { Router } from "express";
import { z } from "zod";
import { requireAuth, getAuthUser } from "../../auth/auth";
import { buildAuthorizeUrl, consumeState, exchangeCodeForToken, fetchGithubUsername, saveConnection } from "../../service/github/github_helper";
import { docsRegistry } from "../../openapi/registry";

const routerConnect = Router();

docsRegistry.registerPath({
    method: "get",
    path: "/auth/github",
    tags: ["GitHub Auth"],
    security: [{ bearerAuth: [] }],
    responses: {
        200: { description: "URL to redirect the user to for GitHub authorization" },
        401: { description: "Not authenticated" },
    },
});

routerConnect.get("/", requireAuth, (req, res) => {
    const { userId } = getAuthUser(req);
    const url = buildAuthorizeUrl(userId);
    res.json({ url });
});

const routerCallback = Router();

docsRegistry.registerPath({
    method: "get",
    path: "/auth/github/callback",
    tags: ["GitHub Auth"],
    request: {
        query: z.object({
            code: z.string(),
            state: z.string(),
        }),
    },
    responses: {
        302: { description: "Redirects back to the frontend once the connection is saved" },
        400: { description: "Invalid or expired state" },
        502: { description: "GitHub exchange or profile lookup failed" },
    },
});

routerCallback.get("/callback", async (req, res) => {
    const { code, state } = req.query as { code: string; state: string };

    const userId = consumeState(state);
    const accessToken = await exchangeCodeForToken(code);
    const githubUsername = await fetchGithubUsername(accessToken);

    await saveConnection(userId, accessToken, githubUsername);

    res.redirect(`${process.env.CORS_ORIGIN}/profile?github=connected`);
});

const router = Router();
router.use(routerConnect);
router.use(routerCallback);

export default router;

