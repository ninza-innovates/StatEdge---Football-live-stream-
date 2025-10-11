import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Grid, List, Search, Trophy, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type TabType = "fixtures" | "table" | "form" | "scorers";

interface League {
  id: number;
  name: string;
  slug: string;
  season: number;
  startDate: string;
  endDate: string;
  logo: string;
}

interface Team {
  id: number;
  name: string;
  logo: string;
}

const League = () => {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("form");
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("next-2-days");

  useEffect(() => {
    fetchLeague();
  }, [slug]);

  const fetchLeague = async () => {
    try {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      setLeague(data);
    } catch (error) {
      console.error("Error fetching league:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1">
            <header className="h-14 border-b flex items-center px-4 bg-card/50">
              <SidebarTrigger />
            </header>
            <main className="p-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-8" />
              <Skeleton className="h-96 w-full" />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!league) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1">
            <header className="h-14 border-b flex items-center px-4 bg-card/50">
              <SidebarTrigger />
            </header>
            <main className="p-6">
              <p className="text-muted-foreground">League not found</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "fixtures", label: "Fixtures" },
    { id: "table", label: "Table" },
    { id: "form", label: "Form" },
    { id: "scorers", label: "Top Scorers" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1">
          <header className="h-14 border-b flex items-center px-4 bg-card/50">
            <SidebarTrigger />
          </header>
          
          <main className="p-6">
            {/* League Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-1">{league.name}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(league.startDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} – {new Date(league.endDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </p>
            </div>

            {/* Matchthread Notice Banner */}
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">Live Matchthreads</h3>
                  <p className="text-sm text-muted-foreground">
                    Matchthreads go live 24 hours before kick-off with the most up-to-date data, analysis, and AI insights.
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next-2-days">Next 2 Days</SelectItem>
                  <SelectItem value="next-7-days">Next 7 Days</SelectItem>
                  <SelectItem value="next-30-days">Next 30 Days</SelectItem>
                  <SelectItem value="all">All Fixtures</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>

              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kick-off" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Times</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6">
              <div className="flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "fixtures" && <FixturesTab leagueId={league.id} setActiveTab={setActiveTab} />}
            {activeTab === "table" && <TableTab leagueId={league.id} />}
            {activeTab === "form" && <FormTab leagueId={league.id} />}
            {activeTab === "scorers" && <ScorersTab leagueId={league.id} />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Fixtures Tab Component
const FixturesTab = ({ leagueId, setActiveTab }: { leagueId: number; setActiveTab: (tab: TabType) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [teams, setTeams] = useState<Map<number, Team>>(new Map());
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFixtures();
    if (user) {
      fetchFavorites();
    }
  }, [leagueId, user]);

  const fetchFixtures = async () => {
    try {
      // Fetch upcoming fixtures (NS = Not Started) for this league
      const { data: fixturesData, error: fixturesError } = await supabase
        .from("fixtures")
        .select("*, goals")
        .eq("league_id", leagueId)
        .eq("status", "NS")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(4);

      if (fixturesError) throw fixturesError;

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*");

      if (teamsError) throw teamsError;

      // Create a map of teams for quick lookup
      const teamsMap = new Map<number, Team>();
      teamsData?.forEach(team => {
        teamsMap.set(team.id, team);
      });

      setTeams(teamsMap);
      setFixtures(fixturesData || []);
    } catch (error) {
      console.error("Error fetching fixtures:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('fixture_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map(f => f.fixture_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (fixtureId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add favorites",
        variant: "destructive",
      });
      return;
    }

    const isFavorited = favorites.has(fixtureId);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('fixture_id', fixtureId);

        if (error) throw error;

        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(fixtureId);
          return newFavorites;
        });

        toast({
          title: "Removed from favorites",
          description: "Match removed from your favorites",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            fixture_id: fixtureId,
          });

        if (error) throw error;

        setFavorites(prev => new Set(prev).add(fixtureId));

        toast({
          title: "Added to favorites",
          description: "Match added to your favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  // Calculate team stats from all fixtures for sidebar
  const calculateTeamStats = () => {
    const teamStats = new Map<number, any>();

    fixtures.forEach(fixture => {
      if (!fixture.goals) return;

      const homeTeamId = fixture.home_team_id;
      const awayTeamId = fixture.away_team_id;
      const homeGoals = fixture.goals.home;
      const awayGoals = fixture.goals.away;

      // Initialize stats if needed
      if (!teamStats.has(homeTeamId)) {
        teamStats.set(homeTeamId, {
          id: homeTeamId,
          matches: [],
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        });
      }
      if (!teamStats.has(awayTeamId)) {
        teamStats.set(awayTeamId, {
          id: awayTeamId,
          matches: [],
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        });
      }

      const homeStats = teamStats.get(homeTeamId);
      const awayStats = teamStats.get(awayTeamId);

      // Update goals
      homeStats.goalsFor += homeGoals;
      homeStats.goalsAgainst += awayGoals;
      awayStats.goalsFor += awayGoals;
      awayStats.goalsAgainst += homeGoals;

      // Update results
      if (homeGoals > awayGoals) {
        homeStats.wins++;
        homeStats.points += 3;
        awayStats.losses++;
      } else if (homeGoals < awayGoals) {
        awayStats.wins++;
        awayStats.points += 3;
        homeStats.losses++;
      } else {
        homeStats.draws++;
        awayStats.draws++;
        homeStats.points += 1;
        awayStats.points += 1;
      }

      // Add match to history (limit to last 5)
      homeStats.matches.unshift({
        date: fixture.date,
        result: homeGoals > awayGoals ? "W" : homeGoals < awayGoals ? "L" : "D",
      });

      awayStats.matches.unshift({
        date: fixture.date,
        result: awayGoals > homeGoals ? "W" : awayGoals < homeGoals ? "L" : "D",
      });
    });

    // Convert to array and sort by points
    const statsArray = Array.from(teamStats.values())
      .map(stat => ({
        ...stat,
        matches: stat.matches.slice(0, 5),
        goalDiff: stat.goalsFor - stat.goalsAgainst,
        form: stat.matches.slice(0, 5).map((m: any) => m.result),
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
      })
      .slice(0, 10);

    return statsArray;
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No fixtures available for this league yet.</p>
      </div>
    );
  }

  const topTeams = calculateTeamStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Fixtures List - Left side (2/3) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <h2 className="text-2xl font-bold">Upcoming Fixtures</h2>
        </div>

        {fixtures.map((fixture) => {
          const homeTeam = teams.get(fixture.home_team_id);
          const awayTeam = teams.get(fixture.away_team_id);
          const fixtureDate = new Date(fixture.date);
          const hasScore = fixture.goals && (fixture.goals.home !== null || fixture.goals.away !== null);

          return (
            <div
              key={fixture.id}
              className="border rounded-xl p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground font-medium">
                  {fixtureDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm font-medium">
                  {fixtureDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                {/* Home Team */}
                <div className="flex items-center gap-4 justify-end">
                  <div className="text-right">
                    <h3 className="text-lg font-bold">{homeTeam?.name || "Unknown"}</h3>
                  </div>
                  {homeTeam?.logo && (
                    <div className="h-12 w-12 rounded-xl bg-background/50 p-2 flex items-center justify-center flex-shrink-0">
                      <img
                        src={homeTeam.logo}
                        alt={homeTeam.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Score or VS */}
                <div className="flex items-center justify-center min-w-[80px]">
                  {fixture.status === 'FT' && hasScore ? (
                    <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                      {fixture.goals.home} - {fixture.goals.away}
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-muted-foreground">VS</div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-4">
                  {awayTeam?.logo && (
                    <div className="h-12 w-12 rounded-xl bg-background/50 p-2 flex items-center justify-center flex-shrink-0">
                      <img
                        src={awayTeam.logo}
                        alt={awayTeam.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{awayTeam?.name || "Unknown"}</h3>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4">
                {fixture.venue && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>📍</span>
                    <span>{fixture.venue}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(fixture.id)}
                    className={`transition-all ${
                      favorites.has(fixture.id)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-muted-foreground hover:text-red-500'
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${favorites.has(fixture.id) ? 'fill-current' : ''}`}
                    />
                  </Button>
                  <Button 
                    size="sm" 
                    className="group bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105 font-semibold"
                    onClick={() => window.location.href = `/match/${fixture.id}`}
                  >
                    View Matchthread
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar - Right side (1/3) */}
      <div className="space-y-6">
        {/* League Table */}
        <div className="border rounded-xl p-6 bg-gradient-to-br from-card to-card/50 sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">League Table</h2>
          </div>

          <div className="space-y-1">
            {topTeams.slice(0, 6).map((team, idx) => {
              const teamData = teams.get(team.id);
              const isTopFour = idx < 4;
              
              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all hover:bg-accent/50 ${
                    isTopFour ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-6 w-6 rounded text-xs font-bold ${
                      isTopFour
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {teamData?.logo && (
                    <div className="h-6 w-6 rounded bg-background/50 p-0.5 flex items-center justify-center">
                      <img
                        src={teamData.logo}
                        alt={teamData.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium truncate">
                    {teamData?.name || "Unknown"}
                  </span>
                  <span className="text-sm font-bold">{team.points}</span>
                </div>
              );
            })}
          </div>

          <Button 
            variant="link" 
            className="w-full mt-4 text-primary group"
            onClick={() => setActiveTab("table")}
          >
            View Full League Table
            <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </div>

        {/* League Form */}
        <div className="border rounded-xl p-6 bg-gradient-to-br from-card to-card/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-5 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
            <h2 className="text-lg font-bold">League Form</h2>
          </div>

          <div className="space-y-3">
            {topTeams.slice(0, 5).map((team) => {
              const teamData = teams.get(team.id);
              const last5Matches = team.matches.slice(0, 5);
              
              return (
                <div key={team.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {teamData?.logo && (
                      <div className="h-6 w-6 rounded bg-background/50 p-0.5 flex items-center justify-center flex-shrink-0">
                        <img
                          src={teamData.logo}
                          alt={teamData.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="text-xs font-semibold truncate">{teamData?.name || "Unknown"}</div>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {last5Matches.map((match: any, matchIdx: number) => (
                      <div
                        key={matchIdx}
                        className={`rounded p-1.5 text-center ${
                          match.result === "W"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : match.result === "D"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        <div className="text-[9px] font-bold mb-0.5">{match.result}</div>
                        <div className="text-[8px] text-muted-foreground">{match.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            variant="link" 
            className="w-full mt-4 text-primary group"
            onClick={() => setActiveTab("form")}
          >
            View Full League Form
            <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Table Tab Component
const TableTab = ({ leagueId }: { leagueId: number }) => {
  const [standings, setStandings] = useState<any[]>([]);
  const [teams, setTeams] = useState<Map<number, Team>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        // Fetch teams
        const { data: teamsData } = await supabase
          .from("teams")
          .select("*");

        const teamsMap = new Map<number, Team>();
        teamsData?.forEach((team) => {
          teamsMap.set(team.id, team);
        });
        setTeams(teamsMap);

        // Fetch fixtures for this league
        const { data: fixturesData } = await supabase
          .from("fixtures")
          .select("*")
          .eq("league_id", leagueId)
          .not("goals", "is", null);

        // Calculate standings
        const standingsMap = new Map<number, any>();

        fixturesData?.forEach((fixture) => {
          const homeGoals = fixture.goals?.home ?? 0;
          const awayGoals = fixture.goals?.away ?? 0;

          // Initialize home team
          if (!standingsMap.has(fixture.home_team_id)) {
            standingsMap.set(fixture.home_team_id, {
              teamId: fixture.home_team_id,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
            });
          }

          // Initialize away team
          if (!standingsMap.has(fixture.away_team_id)) {
            standingsMap.set(fixture.away_team_id, {
              teamId: fixture.away_team_id,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
            });
          }

          const homeStats = standingsMap.get(fixture.home_team_id);
          const awayStats = standingsMap.get(fixture.away_team_id);

          // Update stats
          homeStats.played++;
          awayStats.played++;
          homeStats.goalsFor += homeGoals;
          homeStats.goalsAgainst += awayGoals;
          awayStats.goalsFor += awayGoals;
          awayStats.goalsAgainst += homeGoals;

          if (homeGoals > awayGoals) {
            homeStats.won++;
            homeStats.points += 3;
            awayStats.lost++;
          } else if (homeGoals < awayGoals) {
            awayStats.won++;
            awayStats.points += 3;
            homeStats.lost++;
          } else {
            homeStats.drawn++;
            awayStats.drawn++;
            homeStats.points += 1;
            awayStats.points += 1;
          }

          homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;
          awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;
        });

        const standingsArray = Array.from(standingsMap.values())
          .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
          });

        setStandings(standingsArray);
      } catch (error) {
        console.error("Error fetching table data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [leagueId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 text-sm text-muted-foreground">
              <th className="text-left py-3 px-2 font-semibold">#</th>
              <th className="text-left py-3 px-2 font-semibold">Team</th>
              <th className="text-center py-3 px-2 font-semibold">P</th>
              <th className="text-center py-3 px-2 font-semibold">W</th>
              <th className="text-center py-3 px-2 font-semibold">D</th>
              <th className="text-center py-3 px-2 font-semibold">L</th>
              <th className="text-center py-3 px-2 font-semibold">GF</th>
              <th className="text-center py-3 px-2 font-semibold">GA</th>
              <th className="text-center py-3 px-2 font-semibold">GD</th>
              <th className="text-center py-3 px-2 font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const team = teams.get(standing.teamId);
              return (
                <tr
                  key={standing.teamId}
                  className={`border-b border-border/30 hover:bg-accent/50 transition-colors ${
                    index < 4
                      ? "bg-emerald-500/5"
                      : index < 6
                      ? "bg-blue-500/5"
                      : index >= standings.length - 3
                      ? "bg-red-500/5"
                      : ""
                  }`}
                >
                  <td className="py-3 px-2 text-sm font-medium">{index + 1}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      {team?.logo && (
                        <div className="h-6 w-6 rounded bg-background/50 p-0.5 flex items-center justify-center flex-shrink-0">
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium">{team?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2 text-sm">{standing.played}</td>
                  <td className="text-center py-3 px-2 text-sm">{standing.won}</td>
                  <td className="text-center py-3 px-2 text-sm">{standing.drawn}</td>
                  <td className="text-center py-3 px-2 text-sm">{standing.lost}</td>
                  <td className="text-center py-3 px-2 text-sm">{standing.goalsFor}</td>
                  <td className="text-center py-3 px-2 text-sm">{standing.goalsAgainst}</td>
                  <td className="text-center py-3 px-2 text-sm font-medium">
                    {standing.goalDifference > 0 ? "+" : ""}
                    {standing.goalDifference}
                  </td>
                  <td className="text-center py-3 px-2 text-sm font-bold">{standing.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40"></div>
          <span className="text-muted-foreground">Champions League</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500/20 border border-blue-500/40"></div>
          <span className="text-muted-foreground">Europa League</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500/20 border border-red-500/40"></div>
          <span className="text-muted-foreground">Relegation</span>
        </div>
      </div>
    </div>
  );
};

// Form Tab Component
const FormTab = ({ leagueId }: { leagueId: number }) => {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [teams, setTeams] = useState<Map<number, Team>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealData();
  }, [leagueId]);

  const fetchRealData = async () => {
    try {
      // Fetch fixtures for this league
      const { data: fixturesData, error: fixturesError } = await supabase
        .from("fixtures")
        .select("*, goals")
        .eq("league_id", leagueId)
        .order("date", { ascending: false })
        .limit(100);

      if (fixturesError) throw fixturesError;

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*");

      if (teamsError) throw teamsError;

      // Create a map of teams for quick lookup
      const teamsMap = new Map<number, Team>();
      teamsData?.forEach(team => {
        teamsMap.set(team.id, team);
      });

      setTeams(teamsMap);
      setFixtures(fixturesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate team stats from fixtures
  const calculateTeamStats = () => {
    const teamStats = new Map<number, any>();

    fixtures.forEach(fixture => {
      if (!fixture.goals) return;

      const homeTeamId = fixture.home_team_id;
      const awayTeamId = fixture.away_team_id;
      const homeGoals = fixture.goals.home;
      const awayGoals = fixture.goals.away;

      // Initialize stats if needed
      if (!teamStats.has(homeTeamId)) {
        teamStats.set(homeTeamId, {
          id: homeTeamId,
          matches: [],
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        });
      }
      if (!teamStats.has(awayTeamId)) {
        teamStats.set(awayTeamId, {
          id: awayTeamId,
          matches: [],
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        });
      }

      const homeStats = teamStats.get(homeTeamId);
      const awayStats = teamStats.get(awayTeamId);

      // Update goals
      homeStats.goalsFor += homeGoals;
      homeStats.goalsAgainst += awayGoals;
      awayStats.goalsFor += awayGoals;
      awayStats.goalsAgainst += homeGoals;

      // Update results
      if (homeGoals > awayGoals) {
        homeStats.wins++;
        homeStats.points += 3;
        awayStats.losses++;
      } else if (homeGoals < awayGoals) {
        awayStats.wins++;
        awayStats.points += 3;
        homeStats.losses++;
      } else {
        homeStats.draws++;
        awayStats.draws++;
        homeStats.points += 1;
        awayStats.points += 1;
      }

      // Add match to history (limit to last 5)
      homeStats.matches.unshift({
        date: fixture.date,
        opponent: teams.get(awayTeamId)?.name || "Unknown",
        home: true,
        score: `${homeGoals}-${awayGoals}`,
        result: homeGoals > awayGoals ? "W" : homeGoals < awayGoals ? "L" : "D",
      });

      awayStats.matches.unshift({
        date: fixture.date,
        opponent: teams.get(homeTeamId)?.name || "Unknown",
        home: false,
        score: `${awayGoals}-${homeGoals}`,
        result: awayGoals > homeGoals ? "W" : awayGoals < homeGoals ? "L" : "D",
      });
    });

    // Convert to array and sort by points
    const statsArray = Array.from(teamStats.values())
      .map(stat => ({
        ...stat,
        matches: stat.matches.slice(0, 5),
        goalDiff: stat.goalsFor - stat.goalsAgainst,
        form: stat.matches.slice(0, 5).map((m: any) => m.result),
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
      })
      .slice(0, 10); // Top 10 teams

    return statsArray;
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const topTeams = calculateTeamStats();

  if (topTeams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No fixture data available for this league yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Team Form Analysis - Left side (2/3) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <h2 className="text-2xl font-bold">Team Form Analysis</h2>
        </div>

        {topTeams.slice(0, 5).map((team, idx) => {
          const teamData = teams.get(team.id);
          return (
            <div
              key={team.id}
              className="group border rounded-xl p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold">
                    {idx + 1}
                  </div>
                  {teamData?.logo && (
                    <div className="h-12 w-12 rounded-xl bg-background/50 p-2 flex items-center justify-center">
                      <img
                        src={teamData.logo}
                        alt={teamData.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{teamData?.name || "Unknown Team"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {team.form.map((result: string, formIdx: number) => (
                        <div
                          key={formIdx}
                          className={`h-5 w-5 rounded text-[10px] font-bold flex items-center justify-center ${
                            result === "W"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : result === "D"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                      {team.points}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Points</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{team.goalsFor}:{team.goalsAgainst}</div>
                    <div className="text-xs text-muted-foreground">GF:GA</div>
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${team.goalDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {team.goalDiff >= 0 ? '+' : ''}{team.goalDiff}
                    </div>
                    <div className="text-xs text-muted-foreground">GD</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {team.matches.map((match: any, matchIdx: number) => {
                  const isWin = match.result === "W";
                  const isDraw = match.result === "D";
                  return (
                    <div
                      key={matchIdx}
                      className={`relative overflow-hidden rounded-lg p-3 border transition-all ${
                        isWin
                          ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40"
                          : isDraw
                          ? "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
                          : "bg-red-500/10 border-red-500/20 hover:border-red-500/40"
                      }`}
                    >
                      <div className="text-[10px] text-muted-foreground mb-1 font-medium">
                        {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs mb-2 line-clamp-2 h-8">
                        <span className="text-muted-foreground">{match.home ? "vs" : "@"}</span>{" "}
                        {match.opponent}
                      </div>
                      <div className="text-sm font-bold">{match.score}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* League Table - Right side (1/3) */}
      <div className="space-y-6">
        <div className="border rounded-xl p-6 bg-gradient-to-br from-card to-card/50 sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">League Table</h2>
          </div>

          <div className="space-y-1">
            {topTeams.slice(0, 10).map((team, idx) => {
              const teamData = teams.get(team.id);
              const isTopFour = idx < 4;
              const isRelegation = idx >= topTeams.length - 3;
              
              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all hover:bg-accent/50 ${
                    isTopFour ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-6 w-6 rounded text-xs font-bold ${
                      isTopFour
                        ? "bg-primary/20 text-primary"
                        : isRelegation
                        ? "bg-red-500/20 text-red-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {teamData?.logo && (
                    <div className="h-6 w-6 rounded bg-background/50 p-0.5 flex items-center justify-center">
                      <img
                        src={teamData.logo}
                        alt={teamData.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium truncate">
                    {teamData?.name || "Unknown"}
                  </span>
                  <span className="text-sm font-bold">{team.points}</span>
                </div>
              );
            })}
          </div>

          <Button variant="link" className="w-full mt-4 text-primary group">
            View Full Table
            <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Top Scorers Tab Component
const ScorersTab = ({ leagueId }: { leagueId: number }) => {
  const [scorers, setScorers] = useState<any[]>([]);
  const [teams, setTeams] = useState<Map<number, Team>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScorersData = async () => {
      try {
        // Fetch teams
        const { data: teamsData } = await supabase
          .from("teams")
          .select("*");

        const teamsMap = new Map<number, Team>();
        teamsData?.forEach((team) => {
          teamsMap.set(team.id, team);
        });
        setTeams(teamsMap);

        // Mock top scorers data (in a real app, this would come from API/database)
        const mockScorers = [
          { id: 1, name: "Erling Haaland", teamId: 33, goals: 27, assists: 5, matches: 29 },
          { id: 2, name: "Mohamed Salah", teamId: 40, goals: 22, assists: 12, matches: 32 },
          { id: 3, name: "Harry Kane", teamId: 47, goals: 20, assists: 3, matches: 31 },
          { id: 4, name: "Ivan Toney", teamId: 55, goals: 19, assists: 4, matches: 28 },
          { id: 5, name: "Ollie Watkins", teamId: 66, goals: 18, assists: 11, matches: 33 },
          { id: 6, name: "Callum Wilson", teamId: 34, goals: 17, assists: 6, matches: 27 },
          { id: 7, name: "Marcus Rashford", teamId: 33, goals: 16, assists: 5, matches: 30 },
          { id: 8, name: "Alexander Isak", teamId: 34, goals: 15, assists: 2, matches: 29 },
          { id: 9, name: "Gabriel Jesus", teamId: 42, goals: 14, assists: 8, matches: 28 },
          { id: 10, name: "Darwin Núñez", teamId: 40, goals: 13, assists: 4, matches: 31 },
        ];

        setScorers(mockScorers);
      } catch (error) {
        console.error("Error fetching scorers data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScorersData();
  }, [leagueId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {scorers.map((scorer, index) => {
          const team = teams.get(scorer.teamId);
          return (
            <div
              key={scorer.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-card/50 backdrop-blur border border-border/50 hover:bg-accent/50 transition-colors"
            >
              <div className="text-2xl font-bold text-muted-foreground w-8">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-lg">{scorer.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {team?.logo && (
                    <div className="h-4 w-4 rounded bg-background/50 p-0.5 flex items-center justify-center flex-shrink-0">
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <span>{team?.name || "Unknown"}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{scorer.goals}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{scorer.assists}</div>
                  <div className="text-xs text-muted-foreground">Assists</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{scorer.matches}</div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default League;
