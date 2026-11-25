import { Router } from "express";
import { requireAuth, getAuthUser } from "../../auth/auth";
import { buildSteamLoginUrl, consumeState, verifySteamCallback, saveSteamConnection } from "../../service/steam/steam_helper";
import { docsRegistry } from "../../openapi/registry";

const routerConnect = Router();

docsRegistry.registerPath({
  method: "get",
  path: "/auth/steam",
  tags: ["Steam Auth"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "URL to redirect the user to for Steam sign-in" },
    401: { description: "Not authenticated" },
  },
});

routerConnect.get("/", requireAuth, (req, res) => {
  const { userId } = getAuthUser(req);
  res.json({ url: buildSteamLoginUrl(userId) });
});

const routerCallback = Router();

docsRegistry.registerPath({
  method: "get",
  path: "/auth/steam/callback",
  tags: ["Steam Auth"],
  responses: {
    302: { description: "Redirects back to the frontend once the connection is saved" },
    400: { description: "Invalid or expired state" },
    401: { description: "Steam identity verification failed" },
  },
});

routerCallback.get("/callback", async (req, res) => {
  const query = req.query as Record<string, string>;

  const userId = consumeState(query.state);
  const steamId64 = await verifySteamCallback(query);

  await saveSteamConnection(userId, steamId64);

  res.redirect(`${process.env.CORS_ORIGIN}/profile?steam=connected`);
});

const router = Router();
router.use(routerConnect);
router.use(routerCallback);

export default router;

