import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
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

async function callRapidAPI(endpoint: string) {
  const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/${endpoint}`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY!,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`);
  }
  
  return await response.json();
}

async function getFixturesForAIGeneration() {
  const twentyFourHours = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const thirtySixHours = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();
  
  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select(`
      *,
      home_team:teams!fixtures_home_team_id_fkey(id, name, logo, country, venue),
      away_team:teams!fixtures_away_team_id_fkey(id, name, logo, country, venue),
      league:leagues!fixtures_league_id_fkey(id, name, slug)
    `)
    .eq('league_id', PREMIER_LEAGUE_ID)
    .eq('status', 'NS')
    .gte('date', twentyFourHours)
    .lte('date', thirtySixHours)
    .limit(50);
  
  if (error) {
    console.error('Error fetching fixtures:', error);
    return [];
  }
  
  const fixturesWithoutSummaries = [];
  for (const fixture of fixtures || []) {
    const { data: existingSummary } = await supabase
      .from('ai_summaries')
      .select('id')
      .eq('fixture_id', fixture.id)
      .single();
    
    if (!existingSummary) {
      fixturesWithoutSummaries.push(fixture);
    }
  }
  
  return fixturesWithoutSummaries;
}

async function getTeamStats(teamId: number) {
  try {
    const data = await callRapidAPI(`teams/statistics?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&team=${teamId}`);
    const stats = data.response;
    
    return {
      form: stats?.form || 'N/A',
      goalsFor: stats?.goals?.for?.total?.total || 0,
      goalsAgainst: stats?.goals?.against?.total?.total || 0,
      rank: stats?.league?.position || 'N/A',
      homeWins: stats?.fixtures?.wins?.home || 0,
      homeDraws: stats?.fixtures?.draws?.home || 0,
      homeLosses: stats?.fixtures?.loses?.home || 0,
      awayWins: stats?.fixtures?.wins?.away || 0,
      awayDraws: stats?.fixtures?.draws?.away || 0,
      awayLosses: stats?.fixtures?.loses?.away || 0
    };
  } catch (error) {
    console.error(`Error fetching stats for team ${teamId}:`, error);
    return null;
  }
}

async function generateAISummary(fixture: any) {
  console.log(`Generating AI summary for fixture ${fixture.id}: ${fixture.home_team.name} vs ${fixture.away_team.name}`);
  
  const [homeStats, awayStats] = await Promise.all([
    getTeamStats(fixture.home_team_id),
    getTeamStats(fixture.away_team_id)
  ]);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const systemPrompt = `You are an elite sports analyst specializing in tactical analysis and betting insights for football matches.
Your role is to provide actionable intelligence that helps users make informed betting decisions.

Key principles:
- Be specific, not generic
- Back claims with statistics
- Focus on exploitable matchups and weaknesses
- Consider recent form, injuries, and tactical trends
- Provide reasoning for predictions, not just outcomes`;

  const userPrompt = `Analyze this Premier League match:
${fixture.home_team.name} vs ${fixture.away_team.name}
Venue: ${fixture.venue}
Date: ${new Date(fixture.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

HOME TEAM (${fixture.home_team.name}):
${homeStats ? `- Recent Form: ${homeStats.form}
- Goals Scored (season): ${homeStats.goalsFor}
- Goals Conceded (season): ${homeStats.goalsAgainst}
- League Position: ${homeStats.rank}
- Home Record: ${homeStats.homeWins}W ${homeStats.homeDraws}D ${homeStats.homeLosses}L` : '- Stats unavailable'}

AWAY TEAM (${fixture.away_team.name}):
${awayStats ? `- Recent Form: ${awayStats.form}
- Goals Scored (season): ${awayStats.goalsFor}
- Goals Conceded (season): ${awayStats.goalsAgainst}
- League Position: ${awayStats.rank}
- Away Record: ${awayStats.awayWins}W ${awayStats.awayDraws}D ${awayStats.awayLosses}L` : '- Stats unavailable'}

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
    "home_lineup": ["GK Name", "RB Name", ... 11 players],
    "home_injuries": [{"player": "Name", "status": "Out - Injury"}],
    "away_formation": "4-3-3",
    "away_lineup": [...],
    "away_injuries": [...]
  },
  "potential_bets": [
    {
      "market": "Match Result",
      "selection": "Home Win",
      "reasoning": "Specific tactical/statistical reasoning",
      "confidence": "high"
    }
  ],
  "confidence": 0.85
}

Be specific and actionable. Use current data only.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    const { error: insertError } = await supabase
      .from('ai_summaries')
      .insert({
        fixture_id: fixture.id,
        quick_summary: aiResponse.quick_summary,
        advanced_summary: aiResponse.advanced_summary,
        key_stats: aiResponse.key_stats,
        tactical_analysis: aiResponse.tactical_analysis,
        lineups_injuries: aiResponse.lineups_injuries,
        potential_bets: aiResponse.potential_bets,
        advanced_insights: aiResponse.advanced_insights || null,
        confidence: aiResponse.confidence || 0.75,
        model: 'gpt-4o',
        fallback_used: false,
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error inserting AI summary:', insertError);
      return { success: false, fixtureId: fixture.id, error: insertError.message };
    }
    
    console.log(`Successfully generated AI summary for fixture ${fixture.id}`);
    return { success: true, fixtureId: fixture.id };
    
  } catch (error) {
    console.error(`Error generating AI summary for fixture ${fixture.id}:`, error);
    return { success: false, fixtureId: fixture.id, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== GENERATE MATCH INSIGHTS CRON JOB STARTED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    const fixtures = await getFixturesForAIGeneration();
    console.log(`Found ${fixtures.length} fixtures needing AI summaries`);
    
    if (fixtures.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No fixtures found requiring AI summaries',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    const results = [];
    for (const fixture of fixtures) {
      const result = await generateAISummary(fixture);
      results.push(result);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log('=== GENERATION COMPLETED ===');
    console.log(`Success: ${successCount}, Failures: ${failureCount}`);
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      fixtures_processed: fixtures.length,
      successes: successCount,
      failures: failureCount,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('=== GENERATION FAILED ===');
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
