import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterLeagueFixtures,
  fixtureInKickoffWindow,
  fixtureMatchesTeamSearch,
  fixtureWindowEnd,
  kickoffWindowForHour,
  parseFixtureDateRange,
  parseKickoffWindow,
} from "./leagueFixtures.ts";

const now = new Date("2026-11-27T15:00:00.000Z");

describe("fixtureWindowEnd", () => {
  it("uses a rolling 48 hour window for the default next-2-days range", () => {
    assert.equal(fixtureWindowEnd("next-2-days", now)?.toISOString(), "2026-11-29T15:00:00.000Z");
  });

  it("uses 7 and 30 day windows, and no end for all fixtures", () => {
    assert.equal(fixtureWindowEnd("next-7-days", now)?.toISOString(), "2026-12-04T15:00:00.000Z");
    assert.equal(fixtureWindowEnd("next-30-days", now)?.toISOString(), "2026-12-27T15:00:00.000Z");
    assert.equal(fixtureWindowEnd("all", now), null);
  });
});

describe("parseFixtureDateRange", () => {
  it("keeps known ranges and falls back to next 2 days", () => {
    assert.equal(parseFixtureDateRange("next-7-days"), "next-7-days");
    assert.equal(parseFixtureDateRange("all"), "all");
    assert.equal(parseFixtureDateRange("tomorrow"), "next-2-days");
  });
});

describe("parseKickoffWindow", () => {
  it("keeps known windows and falls back to all times", () => {
    assert.equal(parseKickoffWindow("evening"), "evening");
    assert.equal(parseKickoffWindow("night"), "all");
  });
});

describe("fixtureMatchesTeamSearch", () => {
  it("matches either team, ignoring case and surrounding spaces", () => {
    assert.equal(fixtureMatchesTeamSearch("Arsenal", "Chelsea", "  ars "), true);
    assert.equal(fixtureMatchesTeamSearch("Arsenal", "Chelsea", "CHEL"), true);
    assert.equal(fixtureMatchesTeamSearch("Arsenal", "Chelsea", "spurs"), false);
  });

  it("treats a blank query as matching every fixture, including missing names", () => {
    assert.equal(fixtureMatchesTeamSearch(undefined, null, "   "), true);
    assert.equal(fixtureMatchesTeamSearch(undefined, null, "arsenal"), false);
  });
});

describe("kickoff windows", () => {
  it("splits the local day at noon and 18:00", () => {
    assert.equal(kickoffWindowForHour(0), "morning");
    assert.equal(kickoffWindowForHour(11), "morning");
    assert.equal(kickoffWindowForHour(12), "afternoon");
    assert.equal(kickoffWindowForHour(17), "afternoon");
    assert.equal(kickoffWindowForHour(18), "evening");
    assert.equal(kickoffWindowForHour(23), "evening");
  });

  it("compares a fixture's local hour with the selected window", () => {
    const morning = new Date(2026, 10, 27, 9, 30);
    const afternoon = new Date(2026, 10, 27, 15, 0);
    const evening = new Date(2026, 10, 27, 20, 0);

    assert.equal(fixtureInKickoffWindow(morning, "morning"), true);
    assert.equal(fixtureInKickoffWindow(morning, "evening"), false);
    assert.equal(fixtureInKickoffWindow(afternoon, "afternoon"), true);
    assert.equal(fixtureInKickoffWindow(evening, "all"), true);
    assert.equal(fixtureInKickoffWindow(new Date("not-a-date"), "evening"), false);
    assert.equal(fixtureInKickoffWindow(new Date("not-a-date"), "all"), true);
  });
});

describe("filterLeagueFixtures", () => {
  const names: Record<number, string> = { 1: "Arsenal", 2: "Chelsea", 3: "Liverpool" };
  const fixtures = [
    { id: 10, date: new Date(2026, 10, 27, 9, 0).toISOString(), home_team_id: 1, away_team_id: 2 },
    { id: 11, date: new Date(2026, 10, 27, 20, 0).toISOString(), home_team_id: 3, away_team_id: 1 },
  ];

  it("keeps every fixture when search is blank and kick-off is all times", () => {
    const visible = filterLeagueFixtures(fixtures, (id) => names[id], { searchQuery: "  ", kickoff: "all" });
    assert.deepEqual(
      visible.map((fixture) => fixture.id),
      [10, 11],
    );
  });

  it("narrows by team name and local kick-off window together", () => {
    const arsenalEvenings = filterLeagueFixtures(fixtures, (id) => names[id], {
      searchQuery: "arsenal",
      kickoff: "evening",
    });
    assert.deepEqual(
      arsenalEvenings.map((fixture) => fixture.id),
      [11],
    );
  });
});
