import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const PREMIER_LEAGUE_ID = 39;
const CURRENT_SEASON = 2025;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callAPI(endpoint: string) {
  console.log(`Calling API: ${endpoint}`);
  const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/${endpoint}`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY!,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }
  
  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== INITIAL DATA SYNC STARTED ===');
    
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY not configured');
    }
    
    // 1. Fetch and populate standings
    console.log('Fetching standings...');
    const standingsData = await callAPI(`standings?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`);
    const standings = standingsData.response?.[0]?.league?.standings?.[0] || [];
    
    console.log(`Inserting ${standings.length} standings...`);
    for (const standing of standings) {
      await supabase.from('standings').upsert({
        league_id: PREMIER_LEAGUE_ID,
        season: CURRENT_SEASON,
        team_id: standing.team.id,
        rank: standing.rank,
        points: standing.points,
        played: standing.all.played,
        win: standing.all.win,
        draw: standing.all.draw,
        lose: standing.all.lose,
        goals_for: standing.all.goals.for,
        goals_against: standing.all.goals.against,
        goal_diff: standing.goalsDiff,
        form: standing.form || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'league_id,season,team_id' });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Fetch and populate top scorers
    console.log('Fetching top scorers...');
    const scorersData = await callAPI(`players/topscorers?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`);
    const scorers = scorersData.response?.slice(0, 20) || [];
    
    console.log(`Inserting ${scorers.length} top scorers...`);
    for (const scorer of scorers) {
      await supabase.from('top_scorers').upsert({
        league_id: PREMIER_LEAGUE_ID,
        season: CURRENT_SEASON,
        player_name: scorer.player.name,
        player_photo: scorer.player.photo,
        team_id: scorer.statistics[0].team.id,
        goals: scorer.statistics[0].goals.total || 0,
        assists: scorer.statistics[0].goals.assists || 0,
        appearances: scorer.statistics[0].games.appearences || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'league_id,season,player_name,team_id' });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Fetch upcoming fixtures
    console.log('Fetching upcoming fixtures...');
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const fixturesData = await callAPI(
      `fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&from=${now.toISOString().split('T')[0]}&to=${twoWeeksLater.toISOString().split('T')[0]}`
    );
    
    const fixtures = fixturesData.response || [];
    console.log(`Inserting ${fixtures.length} fixtures...`);
    
    for (const fixture of fixtures) {
      await supabase.from('fixtures').upsert({
        id: fixture.fixture.id,
        league_id: PREMIER_LEAGUE_ID,
        home_team_id: fixture.teams.home.id,
        away_team_id: fixture.teams.away.id,
        date: fixture.fixture.date,
        venue: fixture.fixture.venue?.name || '',
        status: fixture.fixture.status.short,
        goals: { home: fixture.goals.home, away: fixture.goals.away },
        stats_json: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }
    
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        standings: standings.length,
        scorers: scorers.length,
        fixtures: fixtures.length
      }
    };
    
    console.log('=== SYNC COMPLETED ===', results);
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('=== SYNC FAILED ===', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
