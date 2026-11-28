/**
 * A saved match, ready to render on the favourites page.
 * Finished fixtures leave `fixtures` for `fixtures_archive`. A favourite whose
 * fixture or clubs can no longer be loaded is skipped so the rest of the list
 * still renders.
 */
export type FavouriteCard = {
  id: string;
  fixture: {
    id: number;
    home_team: { name: string; logo: string | null };
    away_team: { name: string; logo: string | null };
    league: { name: string };
    date: string;
    status: string;
    goals: { home: number; away: number } | null;
  };
};

export type FavouriteFixtureSource = {
  id: number;
  home_team_id: number;
  away_team_id: number;
  league_id: number;
  date: string;
  status: string;
  goals: unknown;
};

export type FavouriteTeamSource = {
  name: string;
  logo?: string | null;
};

/** Accept a live or archived fixture row. Anything else is treated as missing. */
export function readFavouriteFixture(value: unknown): FavouriteFixtureSource | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;

  const fixture = row as Partial<FavouriteFixtureSource>;
  if (
    typeof fixture.id !== "number" ||
    typeof fixture.home_team_id !== "number" ||
    typeof fixture.away_team_id !== "number" ||
    typeof fixture.league_id !== "number" ||
    typeof fixture.date !== "string" ||
    typeof fixture.status !== "string"
  ) {
    return null;
  }

  return {
    id: fixture.id,
    home_team_id: fixture.home_team_id,
    away_team_id: fixture.away_team_id,
    league_id: fixture.league_id,
    date: fixture.date,
    status: fixture.status,
    goals: fixture.goals ?? null,
  };
}

function numericScore(goals: unknown): { home: number; away: number } | null {
  if (!goals || typeof goals !== "object" || Array.isArray(goals)) return null;
  const record = goals as { home?: unknown; away?: unknown };
  if (typeof record.home !== "number" || typeof record.away !== "number") return null;
  if (!Number.isFinite(record.home) || !Number.isFinite(record.away)) return null;
  return { home: record.home, away: record.away };
}

/**
 * Build one favourites card.
 * Returns null when the fixture or either club is missing, so the caller can
 * drop that row instead of throwing while mapping the list.
 */
export function toFavouriteCard(input: {
  id: string;
  fixture: FavouriteFixtureSource | null | undefined;
  homeTeam: FavouriteTeamSource | null | undefined;
  awayTeam: FavouriteTeamSource | null | undefined;
  leagueName: string | null | undefined;
}): FavouriteCard | null {
  const homeName = input.homeTeam?.name?.trim();
  const awayName = input.awayTeam?.name?.trim();
  if (!input.fixture || !homeName || !awayName) return null;

  const leagueName = input.leagueName?.trim();

  return {
    id: input.id,
    fixture: {
      id: input.fixture.id,
      home_team: { name: homeName, logo: input.homeTeam?.logo ?? null },
      away_team: { name: awayName, logo: input.awayTeam?.logo ?? null },
      league: { name: leagueName || "Unknown league" },
      date: input.fixture.date,
      status: input.fixture.status,
      goals: numericScore(input.fixture.goals),
    },
  };
}
