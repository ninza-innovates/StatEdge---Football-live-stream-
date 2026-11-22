import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickFeaturedInsights, type InsightStanding } from "./featuredInsights.ts";

function fixture(id: number, home: number, away: number) {
  return { id, home_team_id: home, away_team_id: away, league_id: 39, date: "2026-11-19T15:00:00Z" };
}

function standing(
  team_id: number,
  rank: number,
  form: string | null = null,
  goals: { for: number; against: number; played: number } = { for: 0, against: 0, played: 10 },
): InsightStanding {
  return {
    team_id,
    rank,
    form,
    goals_for: goals.for,
    goals_against: goals.against,
    played: goals.played,
  };
}

describe("pickFeaturedInsights", () => {
  it("returns nothing when fixtures or standings are empty", () => {
    const rows = [standing(1, 1), standing(2, 2)];
    assert.deepEqual(pickFeaturedInsights([], rows), []);
    assert.deepEqual(pickFeaturedInsights([fixture(1, 1, 2)], []), []);
  });

  it("tags a top-six clash and keeps that fixture's extra fields", () => {
    const fx = fixture(10, 1, 2);
    const [insight] = pickFeaturedInsights(
      [fx],
      [standing(1, 2, "W"), standing(2, 6, "D")],
    );
    assert.equal(insight.tag, "Big Match");
    assert.equal(insight.title, "Top-table clash");
    assert.equal(insight.heat, 95);
    assert.equal(insight.fixture, fx);
  });

  it("does not treat rank 7 as a top-six side", () => {
    const insights = pickFeaturedInsights(
      [fixture(11, 1, 2)],
      [standing(1, 6), standing(2, 7)],
    );
    assert.deepEqual(insights, []);
  });

  it("tags a rank gap of 8 as an upset and ignores a gap of 7", () => {
    const upset = pickFeaturedInsights(
      [fixture(12, 1, 2)],
      [standing(1, 1), standing(2, 9)],
    );
    assert.equal(upset[0]?.tag, "Upset Watch");
    assert.equal(upset[0]?.heat, 88);

    const close = pickFeaturedInsights(
      [fixture(13, 1, 2)],
      [standing(1, 1), standing(2, 8)],
    );
    assert.deepEqual(close, []);
  });

  it("tags combined form of 7, counting wins as 1 and draws as 0.5", () => {
    const hot = pickFeaturedInsights(
      [fixture(14, 1, 2)],
      [standing(1, 8, "WWWWWW"), standing(2, 9, "DD")],
    );
    assert.equal(hot[0]?.tag, "Hot Form");
    assert.equal(hot[0]?.heat, 92);

    const warm = pickFeaturedInsights(
      [fixture(15, 1, 2)],
      [standing(1, 8, "WWWWWW"), standing(2, 9, "D")],
    );
    assert.deepEqual(warm, []);
  });

  it("tags combined goals per game of 5.6 and skips a side that has not played", () => {
    const goals = pickFeaturedInsights(
      [fixture(16, 1, 2)],
      [
        standing(1, 8, null, { for: 28, against: 0, played: 10 }),
        standing(2, 9, null, { for: 28, against: 0, played: 10 }),
      ],
    );
    assert.equal(goals[0]?.tag, "High Scoring");
    assert.equal(goals[0]?.heat, 86);

    const quiet = pickFeaturedInsights(
      [fixture(17, 1, 2)],
      [
        standing(1, 8, null, { for: 28, against: 0, played: 10 }),
        standing(2, 9, null, { for: 0, against: 0, played: 0 }),
      ],
    );
    assert.deepEqual(quiet, []);
  });

  it("keeps the hottest tag when one fixture matches more than one rule", () => {
    const [insight] = pickFeaturedInsights(
      [fixture(18, 1, 2)],
      [
        standing(1, 1, "WWWWWWW", { for: 40, against: 20, played: 10 }),
        standing(2, 2, "WWWWWWW", { for: 40, against: 20, played: 10 }),
      ],
    );
    assert.equal(insight.tag, "Big Match");
    assert.equal(insight.heat, 95);
  });

  it("returns at most three fixtures, hottest first", () => {
    const fixtures = [
      fixture(1, 1, 2),
      fixture(2, 3, 4),
      fixture(3, 5, 6),
      fixture(4, 7, 8),
    ];
    const standings = [
      standing(1, 1),
      standing(2, 12),
      standing(3, 1),
      standing(4, 2),
      standing(5, 10, "WWWWWW"),
      standing(6, 11, "DD"),
      standing(7, 10, null, { for: 40, against: 30, played: 10 }),
      standing(8, 11, null, { for: 40, against: 30, played: 10 }),
    ];

    const insights = pickFeaturedInsights(fixtures, standings);
    assert.deepEqual(
      insights.map((insight) => [insight.fixture.id, insight.tag, insight.heat]),
      [
        [2, "Big Match", 95],
        [3, "Hot Form", 92],
        [1, "Upset Watch", 88],
      ],
    );
  });

  it("uses the first standing row when a club is listed twice", () => {
    const insights = pickFeaturedInsights(
      [fixture(19, 1, 2)],
      [standing(1, 1), standing(1, 12), standing(2, 2)],
    );
    assert.equal(insights[0]?.tag, "Big Match");
  });
});
