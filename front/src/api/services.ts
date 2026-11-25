import { request } from "./client";

type Service = "github" | "steam";

const SERVICE_LABELS: Record<Service, string> = {
  github: "GitHub",
  steam: "Steam",
};

function serviceRequest<T>(service: Service, endpoint: string) {
  const label = SERVICE_LABELS[service];
  return request<T>(`/service/${service}/${endpoint}`, {
    errors: {
      401: `${label} account not connected`,
      502: `${label} API error`,
    },
    fallback: `Unable to retrieve ${label} data`,
  });
}

async function connectUrlRequest(service: Service): Promise<string> {
  const { url } = await request<{ url: string }>(`/auth/${service}`, {
    fallback: `Unable to start ${SERVICE_LABELS[service]} connection`,
  });
  return url;
}


export type GithubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
};

export type GithubContributions = {
  total: number;
  days: { date: string; count: number }[];
};

export const githubConnectUrlRequest = () => connectUrlRequest("github");

export const githubReposRequest = () =>
  serviceRequest<GithubRepo[]>("github", "github_repos");

export const githubContributionsRequest = () =>
  serviceRequest<GithubContributions>("github", "github_contributions");


export type SteamLib = {
  appid: number;
  name: string;
  playtime_forever_minutes: number;
  img_icon_url: string;
};

export type SteamRecentGame = {
  appid: number;
  name: string;
  playtime_2weeks_minutes: number;
  playtime_forever_minutes: number;
};

export const steamConnectUrlRequest = () => connectUrlRequest("steam");

export const steamLibRequest = () =>
  serviceRequest<SteamLib[]>("steam", "steam_library");

export const steamRecentActivityRequest = () =>
  serviceRequest<SteamRecentGame[]>("steam", "steam_recent_activity");
