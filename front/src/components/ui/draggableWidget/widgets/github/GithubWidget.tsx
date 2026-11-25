import { useMemo, useState } from "react";
import { githubReposRequest, type GithubRepo } from "../../../../../api/services";
import { WidgetState, useWidgetData } from "../Shared.tsx";
import "./GithubWidget.css";

type SortMode = "updated-desc" | "updated-asc" | "name";

const byUpdate = (a: GithubRepo, b: GithubRepo) =>
  new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();

const SORTERS: Record<SortMode, (a: GithubRepo, b: GithubRepo) => number> = {
  "updated-desc": (a, b) => byUpdate(b, a),
  "updated-asc": byUpdate,
  name: (a, b) => a.name.localeCompare(b.name),
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function GithubWidget() {
  const { data: repos, error, loading } = useWidgetData(githubReposRequest);
  const [sortMode, setSortMode] = useState<SortMode>("updated-desc");

  const sortedRepos = useMemo(
    () => [...(repos ?? [])].sort(SORTERS[sortMode]),
    [repos, sortMode]
  );

  if (loading) return <WidgetState>Loading…</WidgetState>;
  if (error) return <WidgetState error>{error}</WidgetState>;
  if (sortedRepos.length === 0) return <WidgetState>No repository</WidgetState>;

  return (
    <div className="github-widget">
      <div className="github-widget-toolbar">
        <select
          className="widget-select github-widget-sort"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Sort repositories"
        >
          <option value="updated-desc">Recently updated</option>
          <option value="updated-asc">Least recently updated</option>
          <option value="name">Name</option>
        </select>
      </div>

      <ul className="github-widget-list">
        {sortedRepos.map((repo) => (
          <li key={repo.full_name} className="github-repo">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="github-repo-name"
              onClick={(e) => e.stopPropagation()}
            >
              {repo.name}
            </a>

            {repo.description && (
              <div className="github-repo-desc">{repo.description}</div>
            )}

            <div className="github-repo-meta">
              {repo.language && <span>{repo.language}</span>}
              <span>★ {repo.stargazers_count}</span>
              <span>{formatDate(repo.updated_at)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
