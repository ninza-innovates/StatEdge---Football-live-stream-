export type InsightFixture = {
  id: number;
  home_team_id: number;
  away_team_id: number;
};

export type InsightStanding = {
  team_id: number;
  rank: number;
  goals_for: number;
  goals_against: number;
  played: number;
  form: string | null;
};

export type InsightTag = "Big Match" | "Upset Watch" | "Hot Form" | "High Scoring";

export type FeaturedInsight<T extends InsightFixture> = {
  tag: InsightTag;
  title: string;
  heat: number;
  fixture: T;
};

const MISSING_RANK = 99;

function formScore(form: string | null): number {
  return (form || "")
    .split("")
    .reduce((acc, c) => acc + (c === "W" ? 1 : c === "D" ? 0.5 : 0), 0);
}

function goalsPerGame(standing: InsightStanding | undefined): number {
  if (!standing || !standing.played) return 0;
  return (standing.goals_for + standing.goals_against) / standing.played;
}

/**
 * Pick the spiciest fixtures for the dashboard.
 * A fixture can match more than one rule; the highest heat is kept,
 * and at most `limit` fixtures are returned (hottest first).
 * The first standing row for a team id is the one that counts.
 */
export function pickFeaturedInsights<T extends InsightFixture>(
  fixtures: readonly T[],
  standings: readonly InsightStanding[],
  limit = 3,
): FeaturedInsight<T>[] {
  if (!fixtures.length || !standings.length) return [];

  const standingOf = (id: number) => standings.find((s) => s.team_id === id);

  const out: FeaturedInsight<T>[] = [];

  for (const fx of fixtures) {
    const home = standingOf(fx.home_team_id);
    const away = standingOf(fx.away_team_id);
    const r1 = home?.rank ?? MISSING_RANK;
    const r2 = away?.rank ?? MISSING_RANK;
    const diff = Math.abs(r1 - r2);
    const combinedForm = formScore(home?.form ?? null) + formScore(away?.form ?? null);
    const combinedGoals = goalsPerGame(home) + goalsPerGame(away);

    // Big Match: both inside top 6
    if (r1 <= 6 && r2 <= 6) {
      out.push({ tag: "Big Match", title: "Top-table clash", heat: 95, fixture: fx });
    }

    // Upset Watch: rank gap is big (>=8)
    if (diff >= 8) {
      out.push({ tag: "Upset Watch", title: "Potential upset on the cards", heat: 88, fixture: fx });
    }

    // Hot Form: combined recent form strong (>=7)
    if (combinedForm >= 7) {
      out.push({ tag: "Hot Form", title: "Both teams in great form", heat: 92, fixture: fx });
    }

    // High Scoring: high avg goals per game
    if (combinedGoals >= 5.6) {
      out.push({ tag: "High Scoring", title: "Likely to see goals", heat: 86, fixture: fx });
    }
  }

  const bestByFx = new Map<number, FeaturedInsight<T>>();
  for (const ins of out.sort((a, b) => b.heat - a.heat)) {
    if (!bestByFx.has(ins.fixture.id)) bestByFx.set(ins.fixture.id, ins);
  }

  return [...bestByFx.values()].slice(0, limit);
}
