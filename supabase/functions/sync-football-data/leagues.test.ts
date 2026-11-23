import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveSyncLeagueIds, TARGET_LEAGUES } from "./leagues.ts";

function params(query: string) {
  return new URLSearchParams(query);
}

describe("resolveSyncLeagueIds", () => {
  it("syncs every supported league when the request names none", () => {
    const selection = resolveSyncLeagueIds(params(""));
    assert.equal(selection.ok, true);
    if (selection.ok) {
      assert.deepEqual(selection.leagueIds, [...TARGET_LEAGUES]);
    }
  });

  it("returns a copy so a caller cannot change later syncs", () => {
    const selection = resolveSyncLeagueIds(params(""));
    assert.equal(selection.ok, true);
    if (!selection.ok) return;
    selection.leagueIds.push(1);
    assert.deepEqual(resolveSyncLeagueIds(params("")), {
      ok: true,
      leagueIds: [...TARGET_LEAGUES],
    });
  });

  it("accepts one supported league", () => {
    const selection = resolveSyncLeagueIds(params("league=39"));
    assert.deepEqual(selection, { ok: true, leagueIds: [39] });
  });

  it("keeps request order and drops repeated ids", () => {
    const selection = resolveSyncLeagueIds(params("leagues=140, 39, 140,61"));
    assert.deepEqual(selection, { ok: true, leagueIds: [140, 39, 61] });
  });

  it("lets a non-empty leagues list win over league", () => {
    const selection = resolveSyncLeagueIds(params("league=39&leagues=61"));
    assert.deepEqual(selection, { ok: true, leagueIds: [61] });
  });

  it("uses league when leagues is blank", () => {
    const selection = resolveSyncLeagueIds(params("leagues=%20&league=78"));
    assert.deepEqual(selection, { ok: true, leagueIds: [78] });
  });

  it("rejects a league outside the supported list", () => {
    const selection = resolveSyncLeagueIds(params("league=999"));
    assert.equal(selection.ok, false);
    if (!selection.ok) {
      assert.match(selection.error, /Unsupported league id: 999/);
      assert.match(selection.error, /39/);
    }
  });

  it("rejects the whole list when any id is unsupported", () => {
    const selection = resolveSyncLeagueIds(params("leagues=39,999"));
    assert.equal(selection.ok, false);
    if (!selection.ok) {
      assert.match(selection.error, /999/);
    }
  });

  it("rejects values parseInt would have truncated", () => {
    for (const query of ["league=39abc", "league=39.5", "leagues=61,39abc"]) {
      const selection = resolveSyncLeagueIds(params(query));
      assert.equal(selection.ok, false, query);
      if (!selection.ok) {
        assert.match(selection.error, /Invalid league id: 39abc|39\.5/);
      }
    }
  });

  it("rejects an explicit list that names no league", () => {
    const selection = resolveSyncLeagueIds(params("leagues=,,,"));
    assert.deepEqual(selection, { ok: false, error: "No league ids provided" });
  });

  it("treats a padded id as the same league", () => {
    const selection = resolveSyncLeagueIds(params("league=039"));
    assert.deepEqual(selection, { ok: true, leagueIds: [39] });
  });
});
