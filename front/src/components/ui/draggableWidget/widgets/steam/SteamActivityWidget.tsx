import { useMemo, useState } from "react";
import { steamRecentActivityRequest, type SteamRecentGame } from "../../../../../api/services";
import { WidgetState, useWidgetData } from "../Shared.tsx";
import { GameLink, SteamToolbar, useSteamLink } from "./SteamShared.tsx";

type SortKey = "recent" | "total" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Playtime (2 weeks)" },
  { value: "total", label: "Total playtime" },
  { value: "name", label: "Name (A → Z)" },
];

const SORTERS: Record<SortKey, (a: SteamRecentGame, b: SteamRecentGame) => number> = {
  recent: (a, b) => (b.playtime_2weeks_minutes ?? 0) - (a.playtime_2weeks_minutes ?? 0),
  total: (a, b) => (b.playtime_forever_minutes ?? 0) - (a.playtime_forever_minutes ?? 0),
  name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
};

function formatPlaytime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m} min` : `${h} h ${String(m).padStart(2, "0")}`;
}

function getImageCandidates(appid: number) {
  const base = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}`;
  return [`${base}/capsule_184x69.jpg`, `${base}/header.jpg`, `${base}/capsule_231x87.jpg`];
}

function GameImage({ appid, name }: { appid: number; name: string }) {
  const [index, setIndex] = useState(0);
  const candidates = getImageCandidates(appid);

  if (index >= candidates.length) {
    return (
      <div
        className="steam-activity__icon steam-activity__icon--placeholder"
        aria-hidden="true"
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      className="steam-activity__icon"
      src={candidates[index]}
      alt=""
      loading="lazy"
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

export function SteamActivityWidget({ link }: { link?: string }) {
  const { data: games, error, loading } = useWidgetData(steamRecentActivityRequest);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [linkMode, setLinkMode] = useSteamLink(link);

  const sortedGames = useMemo(
    () => [...(games ?? [])].sort(SORTERS[sortKey]),
    [games, sortKey]
  );

  if (loading) return <WidgetState>Loading…</WidgetState>;
  if (error) return <WidgetState error>{error}</WidgetState>;
  if (sortedGames.length === 0) {
    return <WidgetState>No activity in the last 2 weeks</WidgetState>;
  }

  return (
    <div className="steam-widget">
      <SteamToolbar linkMode={linkMode} onLinkModeChange={setLinkMode}>
        <select
          className="widget-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="Sort games"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SteamToolbar>

      <ul className="steam-activity__list">
        {sortedGames.map((game) => (
          <li key={game.appid}>
            <GameLink
              appid={game.appid}
              linkMode={linkMode}
              className="steam-activity__item"
            >
              <GameImage appid={game.appid} name={game.name} />
              <div className="steam-activity__info">
                <span className="steam-activity__name">{game.name}</span>
                <span className="steam-activity__playtime">
                  {formatPlaytime(game.playtime_2weeks_minutes ?? 0)} (2 wks) ·{" "}
                  {formatPlaytime(game.playtime_forever_minutes ?? 0)} total
                </span>
              </div>
            </GameLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
