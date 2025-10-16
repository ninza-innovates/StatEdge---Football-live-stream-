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
import { QuickNav } from "@/components/matchthread/QuickNav";
import { generateMatchTitle } from "@/utils/matchSlug";
import PricingModal from "@/components/PricingModal";
import { Sparkles, BarChart3, Target, TrendingUp, Users, DollarSign } from "lucide-react";

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
    // Only show pricing modal if subscription check is complete AND user is not subscribed
    // Add a small delay to avoid flashing during initial load
    const timer = setTimeout(() => {
      if (!subscriptionLoading && !isSubscribed) {
        setPricingModalOpen(true);
      }
    }, 500);

    return () => clearTimeout(timer);
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
            <main className="p-4 lg:p-6">
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
            <main className="p-4 lg:p-6">
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

  const quickNavSections = [
    { id: "teams", label: "Teams", icon: <Users className="h-4 w-4" /> },
    { id: "ai-summary", label: "AI Analysis", icon: <Sparkles className="h-4 w-4" /> },
    { id: "stats", label: "Stats", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "tactical", label: "Tactics", icon: <Target className="h-4 w-4" /> },
    { id: "insights", label: "Insights", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "lineups", label: "Lineups", icon: <Users className="h-4 w-4" /> },
    { id: "betting", label: "Betting", icon: <DollarSign className="h-4 w-4" /> },
  ];

  return (
    <>
      <Helmet>
        <title>{metaTitle} - Match Thread | StatEdge</title>
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
              <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(`/league/${league.slug}`)}
                  className="mb-4 -ml-2"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to {league.name}</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </div>

              {/* Hero Section */}
              <HeroSection 
                league={league}
                date={fixture.date}
                venue={fixture.venue}
                status={fixture.status}
              />

              {/* Quick Navigation */}
              <QuickNav sections={quickNavSections} />

              {/* Main Content */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {/* Teams Comparison */}
                <div id="teams">
                  <TeamsComparison 
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    keyStats={aiSummary?.key_stats}
                  />
                </div>

                {/* AI Summary Card */}
                {aiSummary && (
                  <div id="ai-summary">
                    <AISummaryCard 
                      quickSummary={aiSummary.quick_summary}
                      advancedSummary={aiSummary.advanced_summary}
                      confidence={aiSummary.confidence}
                      model={aiSummary.model}
                    />
                  </div>
                )}

                {/* Stats Comparison */}
                {aiSummary?.key_stats && (
                  <div id="stats">
                    <StatsComparison keyStats={aiSummary.key_stats} />
                  </div>
                )}

                {/* Tactical Analysis */}
                {aiSummary?.tactical_analysis && (
                  <div id="tactical">
                    <TacticalAnalysis analysis={aiSummary.tactical_analysis} />
                  </div>
                )}

                {/* Advanced Insights */}
                {aiSummary?.advanced_insights && (
                  <div id="insights">
                    <AdvancedInsights insights={aiSummary.advanced_insights} />
                  </div>
                )}

                {/* Lineups & Injuries */}
                {aiSummary?.lineups_injuries && (
                  <div id="lineups">
                    <LineupsSection 
                      lineupsData={aiSummary.lineups_injuries}
                      homeTeam={homeTeam.name}
                      awayTeam={awayTeam.name}
                    />
                  </div>
                )}

                {/* Betting Insights */}
                {aiSummary?.potential_bets && (
                  <div id="betting">
                    <BettingInsights bets={aiSummary.potential_bets} />
                  </div>
                )}

                {/* No AI Summary Message */}
                {!aiSummary && (
                  <div className="border rounded-xl p-6 sm:p-8 lg:p-12 text-center bg-card/50">
                    <p className="text-sm sm:text-base text-muted-foreground">
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
