import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Debug: Log all available env vars (without revealing values)
console.log('Available environment variables:', Object.keys(Deno.env.toObject()).filter(k => !k.includes('SECRET')).join(', '));
console.log('RAPIDAPI_KEY is set:', !!RAPIDAPI_KEY);

if (!RAPIDAPI_KEY) {
  console.error('CRITICAL: RAPIDAPI_KEY not found in environment variables!');
  console.error('Please add RAPIDAPI_KEY secret in Supabase Dashboard → Settings → Edge Functions');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const PREMIER_LEAGUE_ID = 39;
const CURRENT_SEASON = 2025;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callRapidAPI(endpoint: string) {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY environment variable is not set. Add it in Supabase Dashboard → Settings → Edge Functions');
  }
  
  const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/${endpoint}`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY!,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API-Football error response:', errorText);
    throw new Error(`API-Football error: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

async function archiveFinishedFixtures() {
  console.log('Starting archival of finished fixtures...');
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: finishedFixtures, error: fetchError } = await supabase
    .from('fixtures')
    .select('*')
    .in('status', ['FT', 'AET', 'PEN'])
    .lt('date', twentyFourHoursAgo);
  
  if (fetchError) {
    console.error('Error fetching finished fixtures:', fetchError);
    return { archived: 0, deleted: 0 };
  }
  
  if (!finishedFixtures || finishedFixtures.length === 0) {
    console.log('No finished fixtures to archive');
    return { archived: 0, deleted: 0 };
  }
  
  console.log(`Found ${finishedFixtures.length} fixtures to archive`);
  
  let archivedCount = 0;
  
  for (const fixture of finishedFixtures) {
    // Check if already archived to avoid duplicates
    const { data: existingArchive } = await supabase
      .from('fixtures_archive')
      .select('id')
      .eq('id', fixture.id)
      .single();
    
    if (existingArchive) {
      console.log(`Fixture ${fixture.id} already archived, skipping...`);
      // Just delete from main table
      await supabase.from('fixtures').delete().eq('id', fixture.id);
      await supabase.from('ai_summaries').delete().eq('fixture_id', fixture.id);
      continue;
    }
    
    const { data: aiSummary } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('fixture_id', fixture.id)
      .single();
    
    const { error: archiveFixtureError } = await supabase
      .from('fixtures_archive')
      .insert({
        ...fixture,
        archived_at: new Date().toISOString()
      });
    
    if (archiveFixtureError) {
      console.error(`Error archiving fixture ${fixture.id}:`, archiveFixtureError);
      continue;
    }
    
    if (aiSummary) {
      await supabase
        .from('ai_summaries_archive')
        .insert({
          ...aiSummary,
          archived_at: new Date().toISOString()
        });
    }
    
    await supabase.from('ai_summaries').delete().eq('fixture_id', fixture.id);
    await supabase.from('fixtures').delete().eq('id', fixture.id);
    archivedCount++;
  }
  
  console.log(`Archived and deleted ${archivedCount} new fixtures`);
  return { archived: archivedCount, deleted: archivedCount };
}

async function syncFixtures() {
  console.log('Syncing Premier League fixtures...');
  
  const now = new Date();
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const upcomingData = await callRapidAPI(
    `fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&from=${now.toISOString().split('T')[0]}&to=${twoWeeksLater.toISOString().split('T')[0]}`
  );
  
  const recentData = await callRapidAPI(
    `fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&from=${oneWeekAgo.toISOString().split('T')[0]}&to=${now.toISOString().split('T')[0]}`
  );
  
  const allFixtures = [...(upcomingData.response || []), ...(recentData.response || [])];
  console.log(`Fetched ${allFixtures.length} fixtures from API-Football`);
  
  let syncedCount = 0;
  const uniqueTeamIds = new Set<number>();
  
  for (const fixture of allFixtures) {
    const fixtureData = {
      id: fixture.fixture.id,
      league_id: PREMIER_LEAGUE_ID,
      home_team_id: fixture.teams.home.id,
      away_team_id: fixture.teams.away.id,
      date: fixture.fixture.date,
      venue: fixture.fixture.venue?.name || '',
      status: fixture.fixture.status.short,
      goals: {
        home: fixture.goals.home,
        away: fixture.goals.away
      },
      stats_json: null,
      updated_at: new Date().toISOString()
    };
    
    uniqueTeamIds.add(fixture.teams.home.id);
    uniqueTeamIds.add(fixture.teams.away.id);
    
    const fortyEightHoursAway = new Date(fixture.fixture.date).getTime() - Date.now();
    if (fortyEightHoursAway > 0 && fortyEightHoursAway < 48 * 60 * 60 * 1000) {
      try {
        const detailsData = await callRapidAPI(`fixtures?id=${fixture.fixture.id}`);
        if (detailsData.response?.[0]?.statistics) {
          fixtureData.stats_json = detailsData.response[0].statistics;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching details for fixture ${fixture.fixture.id}:`, error);
      }
    }
    
    const { error } = await supabase
      .from('fixtures')
      .upsert(fixtureData, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error upserting fixture ${fixture.fixture.id}:`, error);
    } else {
      syncedCount++;
    }
  }
  
  console.log(`Synced ${syncedCount} fixtures`);
  
  for (const teamId of uniqueTeamIds) {
    try {
      const teamData = await callRapidAPI(`teams?id=${teamId}&season=${CURRENT_SEASON}`);
      const team = teamData.response?.[0]?.team;
      
      if (team) {
        await supabase
          .from('teams')
          .upsert({
            id: team.id,
            name: team.name,
            logo: team.logo,
            country: team.country || '',
            venue: teamData.response[0]?.venue?.name || '',
            founded: team.founded || null,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error syncing team ${teamId}:`, error);
    }
  }
  
  console.log(`Synced ${uniqueTeamIds.size} teams`);
  
  return { fixtures: syncedCount, teams: uniqueTeamIds.size };
}

async function syncStandings() {
  console.log('Syncing Premier League standings...');
  
  try {
    const standingsData = await callRapidAPI(
      `standings?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`
    );
    
    const standings = standingsData.response?.[0]?.league?.standings?.[0];
    
    if (!standings || standings.length === 0) {
      console.log('No standings data available');
      return 0;
    }
    
    for (const standing of standings) {
      await supabase
        .from('standings')
        .upsert({
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
    
    console.log(`Synced ${standings.length} standings entries`);
    return standings.length;
  } catch (error) {
    console.error('Error syncing standings:', error);
    return 0;
  }
}

async function syncTopScorers() {
  console.log('Syncing Premier League top scorers...');
  
  try {
    const scorersData = await callRapidAPI(
      `players/topscorers?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`
    );
    
    const scorers = scorersData.response;
    
    if (!scorers || scorers.length === 0) {
      console.log('No top scorers data available');
      return 0;
    }
    
    for (const scorer of scorers.slice(0, 20)) {
      await supabase
        .from('top_scorers')
        .upsert({
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
    
    console.log(`Synced ${Math.min(20, scorers.length)} top scorers`);
    return Math.min(20, scorers.length);
  } catch (error) {
    console.error('Error syncing top scorers:', error);
    return 0;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SYNC FOOTBALL DATA CRON JOB STARTED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    const archiveResults = await archiveFinishedFixtures();
    console.log('Archive results:', archiveResults);
    
    const syncResults = await syncFixtures();
    console.log('Sync results:', syncResults);
    
    const standingsCount = await syncStandings();
    console.log('Standings synced:', standingsCount);
    
    const scorersCount = await syncTopScorers();
    console.log('Top scorers synced:', scorersCount);
    
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      archived: archiveResults.archived,
      synced: {
        ...syncResults,
        standings: standingsCount,
        topScorers: scorersCount
      }
    };
    
    console.log('=== SYNC COMPLETED SUCCESSFULLY ===');
    console.log('Results:', results);
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('=== SYNC FAILED ===');
    console.error('Error:', error);
    
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
