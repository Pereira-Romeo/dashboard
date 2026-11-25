import { useMemo, useState } from "react";
import { githubContributionsRequest, type GithubContributions } from "../../../../../api/services";
import { WidgetState, useWidgetData } from "../Shared.tsx";
import "./GithubContributionsWidget.css";

type Day = GithubContributions["days"][number];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const LEVELS = [0, 1, 2, 3, 4];
const ALL_MONTHS = "all";

const monthKey = (day: Day) => day.date.slice(0, 7);

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

function getLevel(count: number, max: number) {
  if (count === 0 || max === 0) return 0;
  return Math.min(Math.ceil((count / max) * 4), 4);
}

function buildWeeks(days: Day[]): (Day | null)[][] {
  if (days.length === 0) return [];

  const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells: (Day | null)[] = [...Array(firstWeekday).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function GithubContributionsWidget() {
  const { data, error, loading } = useWidgetData(githubContributionsRequest);
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS);

  const monthKeys = useMemo(
    () => Array.from(new Set((data?.days ?? []).map(monthKey))).reverse(),
    [data]
  );

  const days = useMemo(() => {
    const all = data?.days ?? [];
    return selectedMonth === ALL_MONTHS
      ? all
      : all.filter((day) => monthKey(day) === selectedMonth);
  }, [data, selectedMonth]);

  const weeks = useMemo(() => buildWeeks(days), [days]);

  if (loading) return <WidgetState>Loading…</WidgetState>;
  if (error) return <WidgetState error>{error}</WidgetState>;
  if (!data || data.days.length === 0) {
    return <WidgetState>No contribution</WidgetState>;
  }

  const max = Math.max(0, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const allMonths = selectedMonth === ALL_MONTHS;

  return (
    <div className="gh-contrib">
      <div className="gh-contrib-header">
        <div className="gh-contrib-total">
          <strong>{total}</strong> contribution{total === 1 ? "" : "s"}
          {allMonths && " in the last 12 months"}
        </div>

        <select
          className="widget-select gh-contrib-month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Month"
        >
          <option value={ALL_MONTHS}>All months</option>
          {monthKeys.map((key) => (
            <option key={key} value={key}>
              {monthLabel(key)}
            </option>
          ))}
        </select>
      </div>

      <div className="gh-contrib-body">
        <div className="gh-contrib-weekdays">
          {WEEKDAYS.map((label, i) => (
            <span key={i} className="gh-contrib-weekday">
              {label}
            </span>
          ))}
        </div>

        <div className="gh-contrib-scroll">
          {!allMonths && (
            <div className="gh-contrib-selected-month">{monthLabel(selectedMonth)}</div>
          )}

          <div className="gh-contrib-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="gh-contrib-week">
                {week.map((day, di) =>
                  day ? (
                    <span
                      key={day.date}
                      className={`gh-contrib-cell level-${getLevel(day.count, max)}`}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                    />
                  ) : (
                    <span key={`empty-${di}`} className="gh-contrib-cell empty" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gh-contrib-legend">
        <span>Less</span>
        {LEVELS.map((level) => (
          <span key={level} className={`gh-contrib-cell level-${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
