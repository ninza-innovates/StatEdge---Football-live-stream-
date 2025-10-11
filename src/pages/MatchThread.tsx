import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { HeroSection } from "@/components/matchthread/HeroSection";
import { TeamsComparison } from "@/components/matchthread/TeamsComparison";
import { AISummaryCard } from "@/components/matchthread/AISummaryCard";
import { StatsComparison } from "@/components/matchthread/StatsComparison";
import { TacticalAnalysis } from "@/components/matchthread/TacticalAnalysis";
import { AdvancedInsights } from "@/components/matchthread/AdvancedInsights";
import { LineupsSection } from "@/components/matchthread/LineupsSection";
import { BettingInsights } from "@/components/matchthread/BettingInsights";
import { generateMatchTitle } from "@/utils/matchSlug";
import PricingModal from "@/components/PricingModal";

interface Fixture {
  id: number;
  home_team_id: number;
  away_team_id: number;
  league_id: number;
  date: string;
  venue: string;
  status: string;
  goals: any;
  stats_json: any;
}

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface League {
  id: number;
  name: string;
  logo: string;
  slug: string;
}

interface AISummary {
  fixture_id: number;
  quick_summary: string;
  advanced_summary: string;
  key_stats: any;
  tactical_analysis: any;
  advanced_insights: any;
  lineups_injuries: any;
  potential_bets: any;
  player_markets: any;
  confidence: number;
  model: string;
}

const MatchThread = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  useEffect(() => {
    fetchMatchData();
  }, [slug]);

  useEffect(() => {
    if (!subscriptionLoading && !isSubscribed) {
      setPricingModalOpen(true);
    }
  }, [isSubscribed, subscriptionLoading]);

  const fetchMatchData = async () => {
    try {
      // Parse slug to get team names (e.g., "leeds-united-vs-sheffield-united")
      const parts = slug?.split('-vs-');
      if (!parts || parts.length !== 2) {
        console.error('Invalid match slug format');
        setLoading(false);
        return;
      }

      const homeTeamSlug = parts[0];
      const awayTeamSlug = parts[1];

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*');

      if (teamsError) throw teamsError;

      // Find matching teams by slug matching
      const homeTeamMatch = teamsData?.find(t => 
        t.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') === homeTeamSlug
      );
      const awayTeamMatch = teamsData?.find(t => 
        t.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') === awayTeamSlug
      );

      if (!homeTeamMatch || !awayTeamMatch) {
        console.error('Teams not found');
        setLoading(false);
        return;
      }

      setHomeTeam(homeTeamMatch);
      setAwayTeam(awayTeamMatch);

      // Fetch fixture for these teams
      const { data: fixtureData, error: fixtureError } = await supabase
        .from('fixtures')
        .select('*')
        .eq('home_team_id', homeTeamMatch.id)
        .eq('away_team_id', awayTeamMatch.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fixtureError) throw fixtureError;

      if (!fixtureData) {
        console.error('Fixture not found');
        setLoading(false);
        return;
      }

      setFixture(fixtureData);

      // Fetch league data
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', fixtureData.league_id)
        .maybeSingle();

      if (leagueError) throw leagueError;
      setLeague(leagueData);

      // Fetch AI summary
      const { data: aiData, error: aiError } = await supabase
        .from('ai_summaries')
        .select('*')
        .eq('fixture_id', fixtureData.id)
        .maybeSingle();

      if (aiError && aiError.code !== 'PGRST116') throw aiError;
      setAiSummary(aiData);

    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1">
            <header className="h-14 border-b flex items-center px-4 bg-card/50">
              <SidebarTrigger />
            </header>
            <main className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-96 w-full" />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!fixture || !homeTeam || !awayTeam || !league) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1">
            <header className="h-14 border-b flex items-center px-4 bg-card/50">
              <SidebarTrigger />
            </header>
            <main className="p-6">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <p className="text-muted-foreground mt-4">Match not found</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const metaTitle = generateMatchTitle(homeTeam.name, awayTeam.name);
  const metaDescription = `Live match thread for ${metaTitle}. Get AI-powered analysis, tactical insights, and betting predictions.`;

  return (
    <>
      <Helmet>
        <title>{metaTitle} - Match Thread | TopCorner</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${metaTitle} - Match Thread`} />
        <meta property="og:description" content={metaDescription} />
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1">
            <header className="h-14 border-b flex items-center px-4 bg-card/50">
              <SidebarTrigger />
            </header>

            <main className="pb-12">
              {/* Back Button */}
              <div className="p-6 pb-0">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(`/league/${league.slug}`)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to {league.name}
                </Button>
              </div>

              {/* Hero Section */}
              <HeroSection 
                league={league}
                date={fixture.date}
                venue={fixture.venue}
                status={fixture.status}
              />

              {/* Main Content */}
              <div className="max-w-7xl mx-auto px-6 space-y-6">
                {/* Teams Comparison */}
                <TeamsComparison 
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  keyStats={aiSummary?.key_stats}
                />

                {/* AI Summary Card */}
                {aiSummary && (
                  <AISummaryCard 
                    quickSummary={aiSummary.quick_summary}
                    advancedSummary={aiSummary.advanced_summary}
                    confidence={aiSummary.confidence}
                    model={aiSummary.model}
                  />
                )}

                {/* Stats Comparison */}
                {aiSummary?.key_stats && (
                  <StatsComparison keyStats={aiSummary.key_stats} />
                )}

                {/* Tactical Analysis */}
                {aiSummary?.tactical_analysis && (
                  <TacticalAnalysis analysis={aiSummary.tactical_analysis} />
                )}

                {/* Advanced Insights */}
                {aiSummary?.advanced_insights && (
                  <AdvancedInsights insights={aiSummary.advanced_insights} />
                )}

                {/* Lineups & Injuries */}
                {aiSummary?.lineups_injuries && (
                  <LineupsSection 
                    lineupsData={aiSummary.lineups_injuries}
                    homeTeam={homeTeam.name}
                    awayTeam={awayTeam.name}
                  />
                )}

                {/* Betting Insights */}
                {aiSummary?.potential_bets && (
                  <BettingInsights bets={aiSummary.potential_bets} />
                )}

                {/* No AI Summary Message */}
                {!aiSummary && (
                  <div className="border rounded-xl p-12 text-center bg-card/50">
                    <p className="text-muted-foreground">
                      AI analysis will be available 24 hours before kick-off
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      <PricingModal 
        open={pricingModalOpen} 
        onOpenChange={setPricingModalOpen}
      />
    </>
  );
};

export default MatchThread;
