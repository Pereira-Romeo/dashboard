import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { HttpError } from "../../error";
import { getSteamId, steamApiFetch } from "./steam_helper";
import { docsRegistry } from "../../openapi/registry";

const gameSchema = z.object({
  appid: z.number().openapi({ example: 620 }),
  name: z.string().openapi({ example: "Portal 2" }),
  playtime_forever_minutes: z.number().openapi({ example: 609 }),
  img_icon_url: z.string().nullable().openapi({ example: "https://media.steampowered.com/steamcommunity/.../icon_id.jpg" }),
});

docsRegistry.registerPath({
  method: "get",
  path: "/service/steam/steam_library",
  tags: ["Steam"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "The authenticated user's Steam game library (empty if their profile is private)",
      content: { "application/json": { schema: z.array(gameSchema) } },
    },
    401: { description: "Not authenticated, or Steam account not connected" },
    502: { description: "Steam API error" },
  },
});

export const widget: WidgetDefinition = {
  name: "steam_library",
  description: "The authenticated user's Steam game library",
  params: [],
  getData: async (_params, user) => {
    const steamId = await getSteamId(user.userId);
    if (!steamId) throw new HttpError(401, "Steam account not connected.");

    const data = await steamApiFetch("/IPlayerService/GetOwnedGames/v1/", {
      steamid: steamId,
      include_appinfo: "true",
      include_played_free_games: "true",
    });

    const games = data.response?.games ?? [];
    return games.map((g: any) => ({
      appid: g.appid,
      name: g.name,
      playtime_forever_minutes: g.playtime_forever,
      img_icon_url: g.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
        : null,
    }));
  },
};

