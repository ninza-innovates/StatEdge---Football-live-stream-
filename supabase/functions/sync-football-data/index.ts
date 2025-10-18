import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
const RAPIDAPI_KEY = "8ea72576efbc62e0e2f7851591b7ba8c"; // move to secret!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// >>> ONLY THESE LEAGUES <<<
const TARGET_LEAGUES = [2, 3, 39, 40, 41, 61, 78, 88, 94, 135, 140, 253];
const CURRENT_SEASON = 2025;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function callRapidAPI(endpoint) {
  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not set in Edge Function secrets");
  }
  const res = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "v3.football.api-sports.io",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("API-Football error:", text);
    throw new Error(`API-Football ${res.status}: ${text}`);
  }
  return await res.json();
}
async function archiveFinishedFixtures() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: finished, error } = await supabase
    .from("fixtures")
    .select("*")
    .in("status", ["FT", "AET", "PEN"])
    .lt("date", cutoff);
  if (error) {
    console.error("Archive fetch error:", error);
    return {
      archived: 0,
      deleted: 0,
    };
  }
  if (!finished?.length)
    return {
      archived: 0,
      deleted: 0,
    };
  let count = 0;
  for (const fx of finished) {
    const { data: exists } = await supabase.from("fixtures_archive").select("id").eq("id", fx.id).single();
    if (!exists) {
      const { data: ai } = await supabase.from("ai_summaries").select("*").eq("fixture_id", fx.id).single();
      const { error: insErr } = await supabase.from("fixtures_archive").insert({
        ...fx,
        archived_at: new Date().toISOString(),
      });
      if (insErr) {
        console.error("Archive insert error:", insErr);
        continue;
      }
      if (ai) {
        await supabase.from("ai_summaries_archive").insert({
          ...ai,
          archived_at: new Date().toISOString(),
        });
      }
    }
    await supabase.from("ai_summaries").delete().eq("fixture_id", fx.id);
    await supabase.from("fixtures").delete().eq("id", fx.id);
    count++;
  }
  return {
    archived: count,
    deleted: count,
  };
}
async function syncFixturesForLeague(leagueId) {
  const now = new Date();
  const to = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const fromRecent = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const upc = await callRapidAPI(
    `fixtures?league=${leagueId}&season=${CURRENT_SEASON}&from=${now.toISOString().slice(0, 10)}&to=${to.toISOString().slice(0, 10)}`,
  );
  await sleep(250);
  const rec = await callRapidAPI(
    `fixtures?league=${leagueId}&season=${CURRENT_SEASON}&from=${fromRecent.toISOString().slice(0, 10)}&to=${now.toISOString().slice(0, 10)}`,
  );
  const all = [...(upc.response || []), ...(rec.response || [])];
  let synced = 0;
  const teamIds = new Set();
  for (const f of all) {
    const row = {
      id: f.fixture.id,
      league_id: leagueId,
      home_team_id: f.teams.home.id,
      away_team_id: f.teams.away.id,
      date: f.fixture.date,
      venue: f.fixture.venue?.name || "",
      status: f.fixture.status.short,
      goals: {
        home: f.goals.home,
        away: f.goals.away,
      },
      stats_json: null,
      updated_at: new Date().toISOString(),
    };
    teamIds.add(f.teams.home.id);
    teamIds.add(f.teams.away.id);
    const msUntilKick = new Date(f.fixture.date).getTime() - Date.now();
    if (msUntilKick > 0 && msUntilKick < 48 * 60 * 60 * 1000) {
      try {
        const details = await callRapidAPI(`fixtures?id=${f.fixture.id}`);
        if (details.response?.[0]?.statistics) row.stats_json = details.response[0].statistics;
        await sleep(400);
      } catch (e) {
        console.error(`Fixture details failed ${f.fixture.id}:`, e);
      }
    }
    const { error } = await supabase.from("fixtures").upsert(row, {
      onConflict: "id",
    });
    if (error) console.error("Fixture upsert error:", error);
    else synced++;
  }
  for (const tid of teamIds) {
    try {
      const td = await callRapidAPI(`teams?id=${tid}&season=${CURRENT_SEASON}`);
      const t = td.response?.[0]?.team;
      if (t) {
        await supabase.from("teams").upsert(
          {
            id: t.id,
            name: t.name,
            logo: t.logo,
            country: t.country || "",
            venue: td.response?.[0]?.venue?.name || "",
            founded: t.founded || null,
            created_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        );
      }
      await sleep(250);
    } catch (e) {
      console.error(`Team sync failed ${tid}:`, e);
    }
  }
  return {
    fixtures: synced,
    teams: teamIds.size,
  };
}
async function syncStandingsForLeague(leagueId) {
  try {
    const data = await callRapidAPI(`standings?league=${leagueId}&season=${CURRENT_SEASON}`);
    const table = data.response?.[0]?.league?.standings?.[0] || [];
    for (const s of table) {
      await supabase.from("standings").upsert(
        {
          league_id: leagueId,
          season: CURRENT_SEASON,
          team_id: s.team.id,
          rank: s.rank,
          points: s.points,
          played: s.all.played,
          win: s.all.win,
          draw: s.all.draw,
          lose: s.all.lose,
          goals_for: s.all.goals.for,
          goals_against: s.all.goals.against,
          goal_diff: s.goalsDiff,
          form: s.form || "",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "league_id,season,team_id",
        },
      );
    }
    await sleep(250);
    return table.length;
  } catch (e) {
    console.error(`Standings failed for league ${leagueId}:`, e);
    return 0;
  }
}
async function syncTopScorersForLeague(leagueId) {
  try {
    const data = await callRapidAPI(`players/topscorers?league=${leagueId}&season=${CURRENT_SEASON}`);
    const list = data.response || [];
    const take = Math.min(20, list.length);
    for (const s of list.slice(0, take)) {
      await supabase.from("top_scorers").upsert(
        {
          league_id: leagueId,
          season: CURRENT_SEASON,
          player_name: s.player.name,
          player_photo: s.player.photo,
          team_id: s.statistics?.[0]?.team?.id,
          goals: s.statistics?.[0]?.goals?.total ?? 0,
          assists: s.statistics?.[0]?.goals?.assists ?? 0,
          appearances: s.statistics?.[0]?.games?.appearences ?? 0,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "league_id,season,player_name,team_id",
        },
      );
    }
    await sleep(250);
    return take;
  } catch (e) {
    console.error(`Top scorers failed for league ${leagueId}:`, e);
    return 0;
  }
}
serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, {
      headers: corsHeaders,
    });
  try {
    const url = new URL(req.url);
    // Optional override: ?league=39 or ?leagues=39,61,140
    const leagueParam = url.searchParams.get("league");
    const leaguesParam = url.searchParams.get("leagues");
    let leagueIds = TARGET_LEAGUES.slice();
    if (leaguesParam) {
      leagueIds = leaguesParam
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
    } else if (leagueParam) {
      const n = parseInt(leagueParam, 10);
      if (!isNaN(n)) leagueIds = [n];
    }
    console.log("=== SYNC START ===", {
      season: CURRENT_SEASON,
      leagues: leagueIds,
    });
    const archive = await archiveFinishedFixtures();
    const perLeague = {};
    for (const lid of leagueIds) {
      await sleep(300); // light pacing between leagues
      const fr = await syncFixturesForLeague(lid);
      const st = await syncStandingsForLeague(lid);
      const ts = await syncTopScorersForLeague(lid);
      perLeague[lid] = {
        fixtures: fr.fixtures,
        teams: fr.teams,
        standings: st,
        topScorers: ts,
      };
    }
    const body = {
      success: true,
      timestamp: new Date().toISOString(),
      archived: archive.archived,
      leaguesProcessed: leagueIds.length,
      perLeague,
    };
    console.log("=== SYNC DONE ===");
    return new Response(JSON.stringify(body), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("SYNC ERROR:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      },
    );
  }
});
