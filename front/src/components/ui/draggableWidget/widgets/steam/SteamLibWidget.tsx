import { useMemo, useState } from "react";
import { steamLibRequest, type SteamLib } from "../../../../../api/services";
import { WidgetState, useWidgetData } from "../Shared";
import { GameLink, SteamToolbar, useSteamLink } from "./SteamShared.tsx";

type SortMode = "playtime-desc" | "playtime-asc" | "name";

const SORTERS: Record<SortMode, (a: SteamLib, b: SteamLib) => number> = {
  "playtime-desc": (a, b) => b.playtime_forever_minutes - a.playtime_forever_minutes,
  "playtime-asc": (a, b) => a.playtime_forever_minutes - b.playtime_forever_minutes,
  name: (a, b) => a.name.localeCompare(b.name),
};

function formatPlaytime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  return hours < 1 ? `${minutes} min` : `${hours} h`;
}

export function SteamLibWidget({ link }: { link?: string }) {
  const { data: games, error, loading } = useWidgetData(steamLibRequest);
  const [sortMode, setSortMode] = useState<SortMode>("playtime-desc");
  const [linkMode, setLinkMode] = useSteamLink(link);

  const sortedGames = useMemo(
    () => [...(games ?? [])].sort(SORTERS[sortMode]),
    [games, sortMode]
  );

  if (loading) return <WidgetState>Loading…</WidgetState>;
  if (error) return <WidgetState error>{error}</WidgetState>;
  if (sortedGames.length === 0) return <WidgetState>No games</WidgetState>;

  return (
    <div className="steam-widget">
      <SteamToolbar linkMode={linkMode} onLinkModeChange={setLinkMode}>
        <select
          className="widget-select"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          aria-label="Sort games"
        >
          <option value="playtime-desc">Playtime ↓</option>
          <option value="playtime-asc">Playtime ↑</option>
          <option value="name">Name</option>
        </select>
      </SteamToolbar>

      <div className="steam-lib__list">
        {sortedGames.map((game) => (
          <GameLink
            key={game.appid}
            appid={game.appid}
            linkMode={linkMode}
            className="steam-lib__item"
          >
            <img className="steam-lib__icon" src={game.img_icon_url} alt="" loading="lazy" />

            <div className="steam-lib__info">
              <div className="steam-lib__name">{game.name}</div>
              <div className="steam-lib__playtime">
                {formatPlaytime(game.playtime_forever_minutes)}
              </div>
            </div>
          </GameLink>
        ))}
      </div>
    </div>
  );
}
