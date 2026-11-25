import { useState, type ReactNode } from "react";
import "../Shared.css";
import "./SteamWidget.css";

export type SteamLink = "library" | "store" | "run";

const LINK_OPTIONS: { value: SteamLink; label: string }[] = [
  { value: "library", label: "Open: Library" },
  { value: "store", label: "Open: Store" },
  { value: "run", label: "Open: Launch" },
];

function isSteamLink(value: string | undefined): value is SteamLink {
  return LINK_OPTIONS.some((option) => option.value === value);
}

function getGameUrl(appid: number, link: SteamLink) {
  switch (link) {
    case "store":
      return `https://store.steampowered.com/app/${appid}`;
    case "run":
      return `steam://run/${appid}`;
    default:
      return `steam://nav/games/details/${appid}`;
  }
}

function openSteamProtocol(url: string) {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => iframe.remove(), 1000);
}

export function useSteamLink(link: string | undefined) {
  return useState<SteamLink>(isSteamLink(link) ? link : "library");
}

type SteamToolbarProps = {
  linkMode: SteamLink;
  onLinkModeChange: (link: SteamLink) => void;
  children: ReactNode;
};

export function SteamToolbar({ linkMode, onLinkModeChange, children }: SteamToolbarProps) {
  return (
    <div className="steam-toolbar" onClick={(e) => e.stopPropagation()}>
      {children}

      <select
        className="widget-select"
        value={linkMode}
        onChange={(e) => onLinkModeChange(e.target.value as SteamLink)}
        aria-label="Click destination"
      >
        {LINK_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type GameLinkProps = {
  appid: number;
  linkMode: SteamLink;
  className: string;
  children: ReactNode;
};

export function GameLink({ appid, linkMode, className, children }: GameLinkProps) {
  const url = getGameUrl(appid, linkMode);
  const isWebLink = linkMode === "store";

  return (
    <a
      className={className}
      href={url}
      target={isWebLink ? "_blank" : undefined}
      rel={isWebLink ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (!isWebLink) {
          e.preventDefault();
          openSteamProtocol(url);
        }
      }}
    >
      {children}
    </a>
  );
}
