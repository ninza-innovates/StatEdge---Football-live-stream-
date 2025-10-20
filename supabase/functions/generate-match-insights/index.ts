// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const RAPIDAPI_KEY = "8ea72576efbc62e0e2f7851591b7ba8c"; // consider moving to env/secret
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
// Fallback if your fixtures table doesn't store a season per-row
const CURRENT_SEASON = 2025;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
async function callRapidAPI(endpoint) {
  const response = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "v3.football.api-sports.io",
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`API-Football error: ${response.status} ${text}`);
  }
  return await response.json();
}
/**
 * Lightweight helper to fetch recent fixtures for a team to compute form/OU trends
 */
async function getRecentFixturesForTeam(teamId, leagueId, lastCount = 10) {
  try {
    const data = await callRapidAPI(`fixtures?team=${teamId}&league=${leagueId}&last=${lastCount}`);
    return data.response || [];
  } catch (e) {
    console.error("Error fetching recent fixtures for team", teamId, e);
    return [];
  }
}
/**
 * Head-to-head last N fixtures between the two teams
 */
async function getHeadToHead(homeTeamId, awayTeamId, lastCount = 5) {
  try {
    const data = await callRapidAPI(`fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}&last=${lastCount}`);
    return data.response || [];
  } catch (e) {
    console.error("Error fetching head-to-head fixtures", homeTeamId, awayTeamId, e);
    return [];
  }
}
/**
 * Get team squad (current players) for a team
 */
async function getTeamSquad(teamId) {
  try {
    const data = await callRapidAPI(`players/squads?team=${teamId}`);
    return data.response || [];
  } catch (e) {
    console.error("Error fetching team squad for team", teamId, e);
    return [];
  }
}

/**
 * Get detailed statistics for specific players (goals, assists, cards, etc.)
 */
async function getPlayerDetailedStats(playerId, leagueId, season) {
  try {
    const data = await callRapidAPI(`players/statistics?player=${playerId}&league=${leagueId}&season=${season}`);
    return data.response || [];
  } catch (e) {
    console.error("Error fetching detailed player stats for player", playerId, e);
    return [];
  }
}
/**
 * Pull fixtures scheduled between +24h and +36h, status=NS,
 * for ALL leagues in your `fixtures` table (no league filter).
 * Skips those that already have an ai_summaries row.
 */ async function getFixturesForAIGeneration() {
  const from = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
  const to = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();
  // 1) Get all summarized fixture IDs (we’ll exclude them)
  const { data: summarized, error: sErr } = await supabase.from("ai_summaries").select("fixture_id");
  if (sErr) {
    console.error("Fetch summarized IDs failed:", sErr);
    return [];
  }
  const summarizedIds = (summarized ?? []).map((r) => r.fixture_id).filter(Boolean);
  // 2) Fetch fixtures in window, excluding summarized ones
  const query = supabase
    .from("fixtures")
    .select(
      `
      *,
      home_team:teams!fixtures_home_team_id_fkey(id,name,logo,country,venue),
      away_team:teams!fixtures_away_team_id_fkey(id,name,logo,country,venue),
      league:leagues!fixtures_league_id_fkey(id,name,slug)
    `,
    )
    .eq("status", "NS")
    .gte("date", from)
    .lte("date", to)
    .order("date", {
      ascending: true,
    })
    .limit(5);
  if (summarizedIds.length) {
    query.not("id", "in", `(${summarizedIds.join(",")})`);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching fixtures:", error);
    return [];
  }
  return data ?? [];
}
/**
 * Fetch stats for a team given the specific league and season.
 */ async function getTeamStats(params) {
  const { teamId, leagueId, season } = params;
  try {
    const data = await callRapidAPI(`teams/statistics?league=${leagueId}&season=${season}&team=${teamId}`);
    const stats = data.response;
    return {
      form: stats?.form || "N/A",
      goalsFor: stats?.goals?.for?.total?.total ?? 0,
      goalsAgainst: stats?.goals?.against?.total?.total ?? 0,
      rank: stats?.league?.position ?? "N/A",
      avgGoalsFor: stats?.goals?.for?.average?.total ? Number(stats.goals.for.average.total) : undefined,
      avgGoalsAgainst: stats?.goals?.against?.average?.total ? Number(stats.goals.against.average.total) : undefined,
      cards: stats?.cards ?? null,
      homeWins: stats?.fixtures?.wins?.home ?? 0,
      homeDraws: stats?.fixtures?.draws?.home ?? 0,
      homeLosses: stats?.fixtures?.loses?.home ?? 0,
      awayWins: stats?.fixtures?.wins?.away ?? 0,
      awayDraws: stats?.fixtures?.draws?.away ?? 0,
      awayLosses: stats?.fixtures?.loses?.away ?? 0,
    };
  } catch (error) {
    console.error(`Error fetching stats for team ${teamId} (league ${leagueId}, season ${season}):`, error);
    return null;
  }
}
async function generateAISummary(fixture) {
  console.log(
    `Generating AI summary for fixture ${fixture.id}: ${fixture.home_team?.name} vs ${fixture.away_team?.name}`,
  );
  // Prefer per-row season if your fixtures table includes it; else fallback
  const season = fixture.season ?? CURRENT_SEASON;
  // League ID for API-Football stats; use joined league if available, else direct column
  const leagueId = fixture.league?.id ?? fixture.league_id;
  const [homeStats, awayStats] = await Promise.all([
    getTeamStats({
      teamId: fixture.home_team_id,
      leagueId,
      season,
    }),
    getTeamStats({
      teamId: fixture.away_team_id,
      leagueId,
      season,
    }),
  ]);
  // Additional context for betting insights
  const [homeRecent, awayRecent, h2hRecent] = await Promise.all([
    getRecentFixturesForTeam(fixture.home_team_id, leagueId, 10),
    getRecentFixturesForTeam(fixture.away_team_id, leagueId, 10),
    getHeadToHead(fixture.home_team_id, fixture.away_team_id, 5),
  ]);
  // Get current squad for both teams
  const [homeSquad, awaySquad] = await Promise.all([
    getTeamSquad(fixture.home_team_id),
    getTeamSquad(fixture.away_team_id),
  ]);

  // Get detailed stats for top 5 players from each team (to avoid too many API calls)
  const topHomePlayers = homeSquad.slice(0, 5);
  const topAwayPlayers = awaySquad.slice(0, 5);

  const [homePlayerDetails, awayPlayerDetails] = await Promise.all([
    Promise.all(topHomePlayers.map((player) => getPlayerDetailedStats(player.id, leagueId, season))),
    Promise.all(topAwayPlayers.map((player) => getPlayerDetailedStats(player.id, leagueId, season))),
  ]);
  // brief spacing to avoid hot-looping requests
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // Venue fallback: prefer fixture.venue, else home team venue, else "TBD"
  const venueName = fixture.venue ?? fixture.home_team?.venue ?? "TBD";
  const systemPrompt = `You are an elite sports analyst specializing in tactical analysis and betting insights for football matches.
Your role is to provide actionable intelligence that helps users make informed betting decisions.

Key principles:
- Be specific, not generic
- Back claims with statistics
- Focus on exploitable matchups and weaknesses
- Consider recent form, injuries, and tactical trends
- Provide reasoning for predictions, not just outcomes`;
  const userPrompt = `Analyze this ${fixture.league?.name ?? "League"} match:
${fixture.home_team?.name} vs ${fixture.away_team?.name}
Venue: ${venueName}
Date: ${new Date(fixture.date).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

HOME TEAM (${fixture.home_team?.name}):
${
  homeStats
    ? `- Recent Form: ${homeStats.form}
- Goals Scored (season): ${homeStats.goalsFor}
- Goals Conceded (season): ${homeStats.goalsAgainst}
- League Position: ${homeStats.rank}
- Home Record: ${homeStats.homeWins}W ${homeStats.homeDraws}D ${homeStats.homeLosses}L`
    : "- Stats unavailable"
}

AWAY TEAM (${fixture.away_team?.name}):
${
  awayStats
    ? `- Recent Form: ${awayStats.form}
- Goals Scored (season): ${awayStats.goalsFor}
- Goals Conceded (season): ${awayStats.goalsAgainst}
- League Position: ${awayStats.rank}
- Away Record: ${awayStats.awayWins}W ${awayStats.awayDraws}D ${awayStats.awayLosses}L`
    : "- Stats unavailable"
}

Recent trends (computed from API data, do not fabricate):
- Home last 10 fixtures (league): ${homeRecent.length}
- Away last 10 fixtures (league): ${awayRecent.length}
- Last 5 H2H fixtures: ${h2hRecent.length}

Current squad data:
- Home squad count: ${homeSquad.length}
- Away squad count: ${awaySquad.length}

Top 5 players with detailed stats:
- Home team detailed stats: ${homePlayerDetails.length} players
- Away team detailed stats: ${awayPlayerDetails.length} players

Generate a comprehensive match analysis in JSON format with these fields:
{
  "quick_summary": "2-3 paragraphs: match context, key tactical battle, predicted outcome with reasoning",
  "advanced_summary": "4-5 paragraphs: detailed tactical analysis, formation breakdown, key player matchups, set piece threat, defensive vulnerabilities",
  "key_stats": {
    "home_form": ["W", "L", "D", "W", "W"],
    "away_form": ["L", "W", "D", "L", "W"],
    "h2h_record": { "home_wins": 3, "draws": 1, "away_wins": 1 },
    "home_avg_goals": 1.8,
    "away_avg_goals": 1.2
    "home_xg_avg": 1.65,                 // expected goals per match
    "away_xg_avg": 1.10,
    "home_possession": 55.2,             // % average possession (0–100)
    "away_possession": 47.8,
    "home_shots_on_target": 5.4,         // average SOT per match
    "away_shots_on_target": 4.1,
    "home_corners_avg": 6.2,             // average corners per match
    "away_corners_avg": 4.9,
    "home_goals_against_avg": 1.1,       // average goals conceded per match
    "away_goals_against_avg": 1.4
  },
  "tactical_analysis": {
    "match_summary": "150-200 words on tactical approach",
    "match_prediction": "Score prediction with detailed reasoning",
    "key_player_matchups": [
      {"home_player": "Name", "away_player": "Name", "description": "Why this matters"}
    ],
    "pressing_styles": {
      "home": "Description of pressing approach",
      "away": "Description of pressing approach"
    },
    "transition_play": {
      "home": "Transition style",
      "away": "Transition style"
    }
  },
  "lineups_injuries": {
    "home_formation": "4-2-3-1",
    "home_lineup": ["GK Name", "RB Name", "... 11 players total"],
    "home_injuries": [{"player": "Name", "status": "Out - Injury"}],
    "away_formation": "4-3-3",
    "away_lineup": ["..."],
    "away_injuries": ["..."]
  },
  "potential_bets": [
    {
      "market": "Match Result",
      "selection": "Home Win | Away Win | Draw",
      "reasoning": "Specific reasoning grounded in recent form, H2H, xG, and defensive metrics",
      "confidence": "high | medium | low"
    },
    {
      "market": "Most Likely Carded",
      "selection": "Player Name (Team)",
      "reasoning": "Backed by player cards per 90, foul rates, and opponent dribbles won",
      "confidence": "high | medium | low"
    },
    {
      "market": "Most Likely Goal/Assist",
      "selection": "Player Name (Team)",
      "reasoning": "Backed by goals+xA per 90, shots on target, involvement share, set-piece duty",
      "confidence": "high | medium | low"
    }
  ],
  "confidence": 0.85
}

Be specific and actionable. Use only the provided data or reasonable inferences from it. Do not invent players or stats.

Additional raw data (for you to use, do not echo directly; summarize):
HOME_RECENT_FIXTURES_JSON: ${JSON.stringify(homeRecent).slice(0, 5000)}
AWAY_RECENT_FIXTURES_JSON: ${JSON.stringify(awayRecent).slice(0, 5000)}
H2H_RECENT_FIXTURES_JSON: ${JSON.stringify(h2hRecent).slice(0, 5000)}
HOME_SQUAD_JSON: ${JSON.stringify(homeSquad).slice(0, 5000)}
AWAY_SQUAD_JSON: ${JSON.stringify(awaySquad).slice(0, 5000)}
HOME_PLAYER_DETAILS_JSON: ${JSON.stringify(homePlayerDetails).slice(0, 5000)}
AWAY_PLAYER_DETAILS_JSON: ${JSON.stringify(awayPlayerDetails).slice(0, 5000)}
`;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: {
          type: "json_object",
        },
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    // Ensure we cap to exactly the three insights if model returns more
    const potentialBets = Array.isArray(aiResponse.potential_bets) ? aiResponse.potential_bets.slice(0, 3) : [];
    const { error: insertError } = await supabase.from("ai_summaries").insert({
      fixture_id: fixture.id,
      quick_summary: aiResponse.quick_summary,
      advanced_summary: aiResponse.advanced_summary,
      key_stats: aiResponse.key_stats,
      tactical_analysis: aiResponse.tactical_analysis,
      lineups_injuries: aiResponse.lineups_injuries,
      potential_bets: potentialBets,
      advanced_insights: aiResponse.advanced_insights || null,
      confidence: aiResponse.confidence ?? 0.75,
      model: "gpt-4o",
      fallback_used: false,
      created_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error("Error inserting AI summary:", insertError);
      return {
        success: false,
        fixtureId: fixture.id,
        error: insertError.message,
      };
    }
    console.log(`Successfully generated AI summary for fixture ${fixture.id}`);
    return {
      success: true,
      fixtureId: fixture.id,
    };
  } catch (error) {
    console.error(`Error generating AI summary for fixture ${fixture.id}:`, error);
    return {
      success: false,
      fixtureId: fixture.id,
      error: error?.message ?? "Unknown error",
    };
  }
}
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  try {
    console.log("=== GENERATE MATCH INSIGHTS CRON JOB STARTED ===");
    console.log("Timestamp:", new Date().toISOString());
    const fixtures = await getFixturesForAIGeneration();
    console.log(`Found ${fixtures.length} fixtures needing AI summaries`);
    if (fixtures.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No fixtures found requiring AI summaries",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        },
      );
    }
    const results = [];
    for (const fixture of fixtures) {
      const result = await generateAISummary(fixture);
      results.push(result);
      // polite spacing between summaries
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;
    console.log("=== GENERATION COMPLETED ===");
    console.log(`Success: ${successCount}, Failures: ${failureCount}`);
    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        fixtures_processed: fixtures.length,
        successes: successCount,
        failures: failureCount,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error("=== GENERATION FAILED ===");
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message ?? "Unknown error",
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
