import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { HttpError } from "../../error";
import { getGithubConnection, githubApiFetch } from "./github_helper";
import { docsRegistry } from "../../openapi/registry";

const repoSchema = z.object({
  name: z.string().openapi({ example: "dashboard" }),
  full_name: z.string().openapi({ example: "octocat/dashboard" }),
  description: z.string().nullable().openapi({ example: "A personal dashboard app" }),
  html_url: z.string().openapi({ example: "https://github.com/octocat/dashboard" }),
  stargazers_count: z.number().openapi({ example: 12 }),
  language: z.string().nullable().openapi({ example: "TypeScript" }),
  updated_at: z.string().openapi({ example: "2026-10-01T12:00:00Z" }),
});

const githubReposResponseSchema = z.array(repoSchema).openapi("GithubReposOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/github/github_repos",
  tags: ["GitHub"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "The authenticated user's most recently updated repositories",
      content: { "application/json": { schema: githubReposResponseSchema } },
    },
    401: { description: "Not authenticated, or GitHub account not connected" },
    502: { description: "GitHub API error" },
  },
});

export const widget: WidgetDefinition = {
  name: "github_repos",
  description: "The authenticated user's most recently updated repositories",
  params: [],
  getData: async (_params, user) => {
    const connection = await getGithubConnection(user.userId);
    if (!connection) throw new HttpError(401, "GitHub account not connected.");

    const repos = (await githubApiFetch("/user/repos?sort=updated&per_page=10", connection.accessToken)) as any[];

    return repos.map((r) => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      stargazers_count: r.stargazers_count,
      language: r.language,
      updated_at: r.updated_at,
    }));
  },
};

