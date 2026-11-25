import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { githubConnections } from "../../db/schema";
import { encrypt, decrypt } from "../../auth/crypto";
import { HttpError } from "../../error";

const CLIENT_ID = String(process.env.GITHUB_CLIENT_ID);
const CLIENT_SECRET = String(process.env.GITHUB_CLIENT_SECRET);
const REDIRECT_URI = String(process.env.GITHUB_REDIRECT_URI);

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_REDIRECT_URI must all be set");
}

const STATE_TTL_MS = 10 * 60_000; // 10 minutes to complete the flow

interface PendingState {
    userId: number;
    expires: number;
}

export interface GithubConnection {
  accessToken: string;
  githubUsername: string;
}

export async function githubApiFetch(path: string, accessToken: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "dashboard-app",
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new HttpError(502, `GitHub API error (${res.status}).`);
  return res.json();
}

export async function githubGraphQL(query: string, variables: Record<string, unknown>, accessToken: string) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "dashboard-app",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new HttpError(502, `GitHub GraphQL error (${res.status}).`);
  const json = await res.json();
  if (json.errors) throw new HttpError(502, "GitHub GraphQL returned errors.");
  return json.data;
}

const pendingStates = new Map<string, PendingState>();

export function buildAuthorizeUrl(userId: number): string {
    const state = crypto.randomBytes(16).toString("hex");
    pendingStates.set(state, { userId, expires: Date.now() + STATE_TTL_MS });

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "read:user",
        state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export function consumeState(state: string): number {
    const pending = pendingStates.get(state);
    pendingStates.delete(state); // one-time use, regardless of outcome

    if (!pending || pending.expires < Date.now()) {
        throw new HttpError(400, "Invalid or expired OAuth state.");
    }

    return pending.userId;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
    const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
        }),
    });

    const data = await res.json();

    if (!res.ok || data.error || !data.access_token) {
        throw new HttpError(502, "Failed to exchange code with GitHub.");
    }

    return data.access_token as string;
}

export async function fetchGithubUsername(accessToken: string): Promise<string> {
    const res = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "dashboard-app", // GitHub's API rejects requests with no User-Agent
        },
    });

    if (!res.ok) {
        throw new HttpError(502, "Failed to fetch GitHub profile.");
    }

    const data = await res.json();
    return data.login as string;
}


export async function saveConnection(userId: number, accessToken: string, githubUsername: string): Promise<void> {
  const encrypted = encrypt(accessToken);

  await db
    .insert(githubConnections)
    .values({ userId, accessToken: encrypted, githubUsername })
    .onDuplicateKeyUpdate({ set: { accessToken: encrypted, githubUsername } });
}

export async function getGithubConnection(userId: number): Promise<GithubConnection | null> {
  const [row] = await db
    .select({ accessToken: githubConnections.accessToken, githubUsername: githubConnections.githubUsername })
    .from(githubConnections)
    .where(eq(githubConnections.userId, userId));

  if (!row) return null;

  try {
    return { accessToken: decrypt(row.accessToken), githubUsername: row.githubUsername };
  } catch {
    // wrong key, tampered value, or a leftover plaintext row: treat as "not connected" so the user can reconnect
    console.error(`Could not decrypt GitHub token for user ${userId}`);
    return null;
  }
}

