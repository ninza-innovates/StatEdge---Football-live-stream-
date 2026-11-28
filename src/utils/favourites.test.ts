import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFavouriteFixture, toFavouriteCard } from "./favourites.ts";

const fixture = {
  id: 42,
  home_team_id: 1,
  away_team_id: 2,
  league_id: 39,
  date: "2026-11-20T15:00:00.000Z",
  status: "FT",
  goals: { home: 2, away: 1 },
};

describe("readFavouriteFixture", () => {
  it("reads a fixture object", () => {
    assert.deepEqual(readFavouriteFixture(fixture), fixture);
  });

  it("reads the first row when the relation comes back as an array", () => {
    assert.equal(readFavouriteFixture([fixture])?.id, 42);
  });

  it("rejects a missing or incomplete fixture", () => {
    assert.equal(readFavouriteFixture(null), null);
    assert.equal(readFavouriteFixture(undefined), null);
    assert.equal(readFavouriteFixture([]), null);
    assert.equal(readFavouriteFixture({ id: 42 }), null);
  });
});

describe("toFavouriteCard", () => {
  const clubs = {
    id: "fav-1",
    fixture,
    homeTeam: { name: "Leeds United", logo: "home.png" },
    awayTeam: { name: "Sheffield United", logo: null },
    leagueName: "Premier League",
  };

  it("builds a card from a live fixture and both clubs", () => {
    assert.deepEqual(toFavouriteCard(clubs), {
      id: "fav-1",
      fixture: {
        id: 42,
        home_team: { name: "Leeds United", logo: "home.png" },
        away_team: { name: "Sheffield United", logo: null },
        league: { name: "Premier League" },
        date: "2026-11-20T15:00:00.000Z",
        status: "FT",
        goals: { home: 2, away: 1 },
      },
    });
  });

  it("keeps a 0-0 score and falls back when the league name is blank", () => {
    const card = toFavouriteCard({
      ...clubs,
      fixture: { ...fixture, goals: { home: 0, away: 0 } },
      leagueName: "  ",
    });
    assert.deepEqual(card?.fixture.goals, { home: 0, away: 0 });
    assert.equal(card?.fixture.league.name, "Unknown league");
  });

  it("drops a favourite whose fixture or club is gone", () => {
    assert.equal(toFavouriteCard({ ...clubs, fixture: null }), null);
    assert.equal(toFavouriteCard({ ...clubs, homeTeam: null }), null);
    assert.equal(toFavouriteCard({ ...clubs, awayTeam: { name: "  ", logo: null } }), null);
  });

  it("hides a score that is not two finite numbers", () => {
    const card = toFavouriteCard({
      ...clubs,
      fixture: { ...fixture, status: "NS", goals: { home: null, away: null } },
    });
    assert.equal(card?.fixture.goals, null);
    assert.equal(card?.fixture.status, "NS");
  });
});
