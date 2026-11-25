import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { HttpError } from "../../error";
import { getSteamId, steamApiFetch } from "./steam_helper";
import { docsRegistry } from "../../openapi/registry";

const recentGameSchema = z.object({
  appid: z.number().openapi({ example: 570 }),
  name: z.string().openapi({ example: "Dota 2" }),
  playtime_2weeks_minutes: z.number().openapi({ example: 312 }),
  playtime_forever_minutes: z.number().openapi({ example: 5423 }),
});

docsRegistry.registerPath({
  method: "get",
  path: "/service/steam/steam_recent_activity",
  tags: ["Steam"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Games the authenticated user has played in the last two weeks",
      content: { "application/json": { schema: z.array(recentGameSchema) } },
    },
    401: { description: "Not authenticated, or Steam account not connected" },
    502: { description: "Steam API error" },
  },
});

export const widget: WidgetDefinition = {
  name: "steam_recent_activity",
  description: "Games the authenticated user has played in the last two weeks",
  params: [],
  getData: async (_params, user) => {
    const steamId = await getSteamId(user.userId);
    if (!steamId) throw new HttpError(401, "Steam account not connected.");

    const data = await steamApiFetch("/IPlayerService/GetRecentlyPlayedGames/v1/", { steamid: steamId });

    const games = data.response?.games ?? [];
    return games.map((g: any) => ({
      appid: g.appid,
      name: g.name,
      playtime_2weeks_minutes: g.playtime_2weeks,
      playtime_forever_minutes: g.playtime_forever,
    }));
  },
};

