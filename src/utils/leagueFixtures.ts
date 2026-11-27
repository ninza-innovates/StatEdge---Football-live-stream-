/**
 * League page fixture toolbar.
 * The date select loads a rolling window from now: 2, 7, or 30 days, or no end.
 * Team search and kick-off time then narrow that list in the browser.
 * Kick-off buckets use the viewer's local hour, the same clock shown on each fixture.
 */

export const FIXTURE_DATE_RANGES = ["next-2-days", "next-7-days", "next-30-days", "all"] as const;
export type FixtureDateRange = (typeof FIXTURE_DATE_RANGES)[number];

export const KICKOFF_WINDOWS = ["all", "morning", "afternoon", "evening"] as const;
export type KickoffWindow = (typeof KICKOFF_WINDOWS)[number];

const RANGE_HOURS: Record<Exclude<FixtureDateRange, "all">, number> = {
  "next-2-days": 48,
  "next-7-days": 24 * 7,
  "next-30-days": 24 * 30,
};

export function parseFixtureDateRange(value: string): FixtureDateRange {
  return (FIXTURE_DATE_RANGES as readonly string[]).includes(value)
    ? (value as FixtureDateRange)
    : "next-2-days";
}

export function parseKickoffWindow(value: string): KickoffWindow {
  return (KICKOFF_WINDOWS as readonly string[]).includes(value) ? (value as KickoffWindow) : "all";
}

/** Inclusive end of the selected window, or null for "All Fixtures". */
export function fixtureWindowEnd(range: FixtureDateRange, now: Date): Date | null {
  if (range === "all") return null;
  return new Date(now.getTime() + RANGE_HOURS[range] * 60 * 60 * 1000);
}

export function fixtureMatchesTeamSearch(
  homeName: string | null | undefined,
  awayName: string | null | undefined,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const home = (homeName ?? "").toLowerCase();
  const away = (awayName ?? "").toLowerCase();
  return home.includes(needle) || away.includes(needle);
}

/** Local hour buckets: morning before 12:00, afternoon before 18:00, evening from 18:00. */
export function kickoffWindowForHour(hour: number): Exclude<KickoffWindow, "all"> {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function fixtureInKickoffWindow(date: Date, window: KickoffWindow): boolean {
  if (window === "all") return true;
  const hour = date.getHours();
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return false;
  return kickoffWindowForHour(hour) === window;
}

export type LeagueFixtureFilter = {
  searchQuery: string;
  kickoff: KickoffWindow;
};

export function filterLeagueFixtures<T extends { date: string; home_team_id: number; away_team_id: number }>(
  fixtures: readonly T[],
  teamName: (teamId: number) => string | null | undefined,
  options: LeagueFixtureFilter,
): T[] {
  return fixtures.filter(
    (fixture) =>
      fixtureMatchesTeamSearch(
        teamName(fixture.home_team_id),
        teamName(fixture.away_team_id),
        options.searchQuery,
      ) && fixtureInKickoffWindow(new Date(fixture.date), options.kickoff),
  );
}
