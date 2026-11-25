import { z } from "zod";
import type { WidgetDefinition } from "../../types/widget";
import { HttpError } from "../../error";
import { getGithubConnection, githubGraphQL } from "./github_helper";
import { docsRegistry } from "../../openapi/registry";

const githubContributionsResponseSchema = z
  .object({
    total: z.number().openapi({ description: "Total contributions in the last year", example: 842 }),
    days: z.array(
      z.object({
        date: z.string().openapi({ example: "2026-09-30" }),
        count: z.number().openapi({ example: 3 }),
      })
    ),
  })
  .openapi("GithubContributionsOutput");

docsRegistry.registerPath({
  method: "get",
  path: "/service/github/github_contributions",
  tags: ["GitHub"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "The authenticated user's contribution calendar for the last year",
      content: { "application/json": { schema: githubContributionsResponseSchema } },
    },
    401: { description: "Not authenticated, or GitHub account not connected" },
    502: { description: "GitHub API error" },
  },
});

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export const widget: WidgetDefinition = {
  name: "github_contributions",
  description: "The authenticated user's contribution calendar for the last year",
  params: [],
  getData: async (_params, user) => {
    const connection = await getGithubConnection(user.userId);
    if (!connection) throw new HttpError(401, "GitHub account not connected.");

    const data = await githubGraphQL(QUERY, { login: connection.githubUsername }, connection.accessToken);

    const calendar = data.user.contributionsCollection.contributionCalendar;
    const days = calendar.weeks.flatMap((week: any) =>
      week.contributionDays.map((d: any) => ({ date: d.date, count: d.contributionCount }))
    );

    return { total: calendar.totalContributions, days };
  },
};

