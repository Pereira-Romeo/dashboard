import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { steamConnections } from "../../db/schema";
import { HttpError } from "../../error";

const API_KEY = process.env.STEAM_API_KEY;
const REALM = process.env.STEAM_REALM;
const RETURN_TO = process.env.STEAM_RETURN_TO;

if (!API_KEY || !REALM || !RETURN_TO) {
  throw new Error("STEAM_API_KEY, STEAM_REALM, and STEAM_RETURN_TO must all be set");
}

const STATE_TTL_MS = 10 * 60_000;

interface PendingState {
  userId: number;
  expires: number;
}

const pendingStates = new Map<string, PendingState>();

export function buildSteamLoginUrl(userId: number): string {
  const state = crypto.randomBytes(16).toString("hex");
  pendingStates.set(state, { userId, expires: Date.now() + STATE_TTL_MS });

  // Steam echoes this whole return_to URL back verbatim, including our own query param.
  const returnTo = `${RETURN_TO}?state=${state}`;

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": REALM,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

export function consumeState(state: string): number {
  const pending = pendingStates.get(state);
  pendingStates.delete(state);

  if (!pending || pending.expires < Date.now()) {
    throw new HttpError(400, "Invalid or expired Steam login state.");
  }

  return pending.userId;
}

// Steam's callback can't be trusted as-is — it must be re-verified with Steam directly,
// or anyone could forge a callback claiming to be any SteamID.
export async function verifySteamCallback(query: Record<string, string>): Promise<string> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("openid.")) params.set(key, value);
  }
  params.set("openid.mode", "check_authentication");

  const res = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const text = await res.text();
  if (!text.includes("is_valid:true")) {
    throw new HttpError(401, "Steam identity verification failed.");
  }

  const claimedId = query["openid.claimed_id"];
  const match = claimedId?.match(/\/id\/(\d+)$/);
  if (!match) throw new HttpError(400, "Could not parse Steam ID from callback.");

  return match[1];
}

export async function saveSteamConnection(userId: number, steamId64: string): Promise<void> {
  await db
    .insert(steamConnections)
    .values({ userId, steamId64 })
    .onDuplicateKeyUpdate({ set: { steamId64 } });
}

export async function getSteamId(userId: number): Promise<string | null> {
  const [row] = await db
    .select({ steamId64: steamConnections.steamId64 })
    .from(steamConnections)
    .where(eq(steamConnections.userId, userId));

  return row?.steamId64 ?? null;
}

export async function steamApiFetch(path: string, params: Record<string, string>) {
  const query = new URLSearchParams({ key: API_KEY, ...params });
  const res = await fetch(`https://api.steampowered.com${path}?${query.toString()}`);
  if (!res.ok) throw new HttpError(502, `Steam API error (${res.status}).`);
  return res.json();
}

