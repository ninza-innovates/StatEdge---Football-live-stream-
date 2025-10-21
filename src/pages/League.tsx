import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Grid, List, Search, Trophy, Heart, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import PricingModal from "@/components/PricingModal";
import { generateMatchSlug } from "@/utils/matchSlug";
import { AdminSyncButton } from "@/components/AdminSyncButton";

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

type StandingRow = {
  id: number;
  league_id: number;
  season: number;
  team_id: number;
  rank: number;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  form: string | null;
  updated_at: string;
};

type FixtureRow = {
  id: number;
  league_id: number;
  date: string; // timestamptz
  home_team_id: number;
  away_team_id: number;
  status: string;
  goals: { home?: number; away?: number } | null;
};

const FINISHED_STATUSES = ["FT", "AET", "PEN"]; // adjust if your data differs
const MATCHES_PER_TEAM = 5; // change to 3 if you want exactly 3

const League = () => {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("fixtures");
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
      const { data, error } = await supabase.from("leagues").select("*").eq("slug", slug).maybeSingle();

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
    <>
      <Helmet>
        <title>{league.name} | StatEdge</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1">
            <header className="h-14 border-b flex items-center px-4 bg-card/50">
              <SidebarTrigger />
            </header>

            <main className="p-6">
              {/* League Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{league.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {new Date(league.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(league.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </p>
                </div>
                <AdminSyncButton />
              </div>

              {/* Matchthread Notice Banner */}
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Live Matchthreads</h3>
                    <p className="text-sm text-muted-foreground">
                      Matchthreads go live 24 hours before kick-off with the most up-to-date data, analysis, and AI
                      insights.
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
                        activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
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
    </>
  );
};

// Fixtures Tab Component
const FixturesTab = ({ leagueId, setActiveTab }: { leagueId: number; setActiveTab: (tab: TabType) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  //const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  const isSubscribed = true;
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [teams, setTeams] = useState<Map<number, Team>>(new Map());
  const [standings, setStandings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  useEffect(() => {
    fetchFixtures();
    fetchStandings();
    if (user) {
      fetchFavorites();
    }
  }, [leagueId, user]);

  const fetchFixtures = async () => {
    const from = new Date(Date.now()).toISOString();
    const to = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    try {
      // Fetch upcoming fixtures (NS = Not Started) for this league
      const { data: fixturesData, error: fixturesError } = await supabase
        .from("fixtures")
        .select("*, goals")
        .eq("league_id", leagueId)
        .eq("status", "NS")
        .gte("date", from)
        .lte("date", to)
        // .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      if (fixturesError) throw fixturesError;

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase.from("teams").select("*");

      if (teamsError) throw teamsError;

      // Create a map of teams for quick lookup
      const teamsMap = new Map<number, Team>();
      teamsData?.forEach((team) => {
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

  const fetchStandings = async () => {
    try {
      const { data, error } = await supabase
        .from("standings")
        .select("*")
        .eq("league_id", leagueId)
        .order("rank", { ascending: true })
        .limit(10);

      if (error) throw error;

      setStandings(data || []);
    } catch (error) {
      console.error("Error fetching standings:", error);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from("user_favorites").select("fixture_id").eq("user_id", user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map((f) => f.fixture_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
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
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("fixture_id", fixtureId);

        if (error) throw error;

        setFavorites((prev) => {
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
        const { error } = await supabase.from("user_favorites").insert({
          user_id: user.id,
          fixture_id: fixtureId,
        });

        if (error) throw error;

        setFavorites((prev) => new Set(prev).add(fixtureId));

        toast({
          title: "Added to favorites",
          description: "Match added to your favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
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
              className="border rounded-xl lg:p-6 p-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground font-medium">
                  {fixtureDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-sm font-medium">
                  {fixtureDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] sm:gap-6 gap-2 items-center">
                {/* Home Team */}
                <div className="flex items-center sm:gap-2 lg:gap-4 gap-1 justify-end">
                  <div className="text-right">
                    <h3 className="lg:text-lg text-sm sm:text-base font-bold">{homeTeam?.name || "Unknown"}</h3>
                  </div>
                  {homeTeam?.logo && (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-background/50 p-1 sm:p-2 flex items-center justify-center flex-shrink-0">
                      <img src={homeTeam.logo} alt={homeTeam.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Score or VS */}
                <div className="flex items-center justify-center lg:min-w-[80px] min-w-[20px] sm:min-w-[40px]">
                  {fixture.status === "FT" && hasScore ? (
                    <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                      {fixture.goals.home} - {fixture.goals.away}
                    </div>
                  ) : (
                    <div className="lg:text-lg sm:text-base text-sm font-semibold text-muted-foreground">VS</div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex items-center sm:gap-2 lg:gap-4 gap-1">
                  {awayTeam?.logo && (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-background/50 p-1 sm:p-2 flex items-center justify-center flex-shrink-0">
                      <img src={awayTeam.logo} alt={awayTeam.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <div>
                    <h3 className="lg:text-lg  sm:text-base text-sm font-bold">{awayTeam?.name || "Unknown"}</h3>
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
                        ? "text-red-500 hover:text-red-600"
                        : "text-muted-foreground hover:text-red-500"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${favorites.has(fixture.id) ? "fill-current" : ""}`} />
                  </Button>
                  {isSubscribed ? (
                    <Button
                      size="sm"
                      className="group bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105 font-semibold text-xs sm:text-sm"
                      onClick={() => {
                        if (homeTeam && awayTeam) {
                          const matchSlug = generateMatchSlug(homeTeam.name, awayTeam.name);
                          navigate(`/match/${matchSlug}`);
                        }
                      }}
                    >
                      <span className="hidden sm:inline">View Matchthread</span>
                      <span className="sm:hidden">Matchthread</span>
                      <span className="ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="group font-semibold text-xs sm:text-sm"
                      onClick={() => setPricingModalOpen(true)}
                    >
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Matchthread</span>
                      <span className="sm:hidden">Matchthread</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing Modal */}
      <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen} />

      {/* Sidebar - Right side (1/3) */}
      <div className="space-y-6">
        {/* League Table */}
        <div className="border rounded-xl p-6 bg-gradient-to-br from-card to-card/50  top-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">League Table</h2>
          </div>

          <div className="space-y-1">
            {standings.slice(0, 6).map((standing, idx) => {
              const teamData = teams.get(standing.team_id);
              const isTopFour = idx < 4;

              return (
                <div
                  key={standing.team_id}
                  className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all hover:bg-accent/50 ${
                    isTopFour ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-6 w-6 rounded text-xs font-bold ${
                      isTopFour ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {standing.rank}
                  </div>
                  {teamData?.logo && (
                    <div className="h-6 w-6 rounded bg-background/50 p-0.5 flex items-center justify-center">
                      <img src={teamData.logo} alt={teamData.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium truncate">{teamData?.name || "Unknown"}</span>
                  <span className="text-sm font-bold">{standing.points}</span>
                </div>
              );
            })}
          </div>

          <Button variant="link" className="w-full mt-4 text-primary group" onClick={() => setActiveTab("table")}>
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
            {standings.slice(0, 5).map((standing) => {
              const teamData = teams.get(standing.team_id);
              const formLetters = standing.form ? standing.form.split("").slice(0, 5) : [];

              return (
                <div key={standing.team_id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {teamData?.logo && (
                      <div className="h-6 w-6 rounded bg-background/50 p-0.5 flex items-center justify-center flex-shrink-0">
                        <img src={teamData.logo} alt={teamData.name} className="h-full w-full object-contain" />
                      </div>
                    )}
                    <div className="text-xs font-semibold truncate">{teamData?.name || "Unknown"}</div>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {formLetters.map((result: string, matchIdx: number) => (
                      <div
                        key={matchIdx}
                        className={`rounded p-1.5 text-center ${
                          result === "W"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : result === "D"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        <div className="text-[9px] font-bold">{result}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="link" className="w-full mt-4 text-primary group" onClick={() => setActiveTab("form")}>
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
        const { data: teamsData } = await supabase.from("teams").select("*");
        const map = new Map<number, Team>();
        teamsData?.forEach((t) => map.set(t.id, t));
        setTeams(map);

        const { data: standingsData, error } = await supabase
          .from("standings")
          .select("*")
          .eq("league_id", leagueId)
          .order("rank", { ascending: true });

        if (error) throw error;
        setStandings(standingsData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTableData();
  }, [leagueId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      {/* Mobile cards (no page overflow) */}
      <div className="md:hidden grid grid-cols-1 gap-3 max-w-full">
        {standings.map((s, index) => {
          const team = teams.get(s.team_id);
          const top4 = index < 4;
          const europa = index >= 4 && index < 6;
          const relegation = index >= standings.length - 3;

          return (
            <div
              key={s.team_id}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 bg-card/60 max-w-full`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-7 w-7 shrink-0 rounded text-xs font-bold grid place-items-center
                    ${top4 ? "bg-primary/20 text-primary" : relegation ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"}`}
                >
                  {s.rank}
                </div>

                {team?.logo && (
                  <div className="h-7 w-7 shrink-0 rounded bg-background/50 p-0.5 grid place-items-center">
                    <img src={team.logo} alt={team.name} className="h-full w-full object-contain max-w-full" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{team?.name || "Unknown"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    P{s.played} • W{s.win} D{s.draw} L{s.lose} • GD {s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-semibold">{s.points}</div>
                <div className="text-[11px] text-muted-foreground">Pts</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table in its own scroller (prevents page scroll) */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border no-scrollbar w-full max-w-full">
          <table className="w-full min-w-[720px] table-fixed text-sm">
            <colgroup>
              <col className="w-[48px]" />
              <col />
              <col className="w-[56px]" />
              <col className="w-[56px]" />
              <col className="w-[56px]" />
              <col className="w-[56px]" />
              <col className="w-[56px]" />
              <col className="w-[56px]" />
              <col className="w-[56px]" />
              <col className="w-[64px]" />
            </colgroup>
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground">
                <th className="text-left py-3 px-3 font-semibold">#</th>
                <th className="text-left py-3 px-3 font-semibold">Team</th>
                <th className="text-center py-3 px-3 font-semibold whitespace-nowrap">P</th>
                <th className="text-center py-3 px-3 font-semibold whitespace-nowrap">W</th>
                <th className="text-center py-3 px-3 font-semibold whitespace-nowrap">D</th>
                <th className="text-center py-3 px-3 font-semibold whitespace-nowrap">L</th>
                <th className="text-center py-3 px-3 font-semibold whitespace-nowrap">GF</th>
                <th className="text-center py-3 px-3 font-semibold whitespace-nowrap">GA</th>
                <th className="text-center py-3 px-3 font-semibold whitespace-nowrap">GD</th>
                <th className="text-center py-3 px-3 font-semibold whitespace-nowrap">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, index) => {
                const team = teams.get(s.team_id);
                const tint =
                  index < 4
                    ? "bg-emerald-500/5"
                    : index < 6
                      ? "bg-blue-500/5"
                      : index >= standings.length - 3
                        ? "bg-red-500/5"
                        : "";

                return (
                  <tr key={s.team_id} className={`border-b hover:bg-accent/50 transition-colors ${tint}`}>
                    <td className="py-3 px-3 font-medium">{s.rank}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {team?.logo && (
                          <div className="h-6 w-6 rounded bg-background/50 p-0.5 grid place-items-center shrink-0">
                            <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
                          </div>
                        )}
                        <span className="font-medium truncate">{team?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 whitespace-nowrap">{s.played}</td>
                    <td className="text-center py-3 px-3 whitespace-nowrap">{s.win}</td>
                    <td className="text-center py-3 px-3 whitespace-nowrap">{s.draw}</td>
                    <td className="text-center py-3 px-3 whitespace-nowrap">{s.lose}</td>
                    <td className="text-center py-3 px-3 whitespace-nowrap">{s.goals_for}</td>
                    <td className="text-center py-3 px-3 whitespace-nowrap">{s.goals_against}</td>
                    <td className="text-center py-3 px-3 whitespace-nowrap">
                      {s.goal_diff > 0 ? "+" : ""}
                      {s.goal_diff}
                    </td>
                    <td className="text-center py-3 px-3 font-bold whitespace-nowrap">{s.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
            <span className="text-muted-foreground">Champions League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500/20 border border-blue-500/40" />
            <span className="text-muted-foreground">Europa League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500/20 border border-red-500/40" />
            <span className="text-muted-foreground">Relegation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Tab Component
const FormTab = ({ leagueId, setActiveTab }: { leagueId: number; setActiveTab: (tab: TabType) => void }) => {
  const [teamsMap, setTeamsMap] = useState<Map<number, Team>>(new Map());
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [fixtures, setFixtures] = useState<FixtureRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // 1) Teams (for name/logo)
      const { data: teamsData, error: teamsError } = await supabase.from("teams").select("*");
      if (teamsError) throw teamsError;
      const tmap = new Map<number, Team>();
      (teamsData || []).forEach((t: Team) => tmap.set(t.id, t));
      setTeamsMap(tmap);

      // 2) Standings (ALL teams in this league, ordered by rank)
      const { data: standingsData, error: standingsError } = await supabase
        .from("standings")
        .select("*")
        .eq("league_id", leagueId)
        .order("rank", { ascending: true });
      if (standingsError) throw standingsError;
      const srows = standingsData || [];
      setStandings(srows);

      // 3) Fixtures: get a big enough slice & group per team in JS
      //    Heuristic: pull last (MATCHES_PER_TEAM * teamCount * 2) fixtures to be safe.
      const teamCount = srows.length || 20;
      const fetchLimit = Math.max(MATCHES_PER_TEAM * teamCount * 2, 200);

      const { data: fixturesData, error: fixturesError } = await supabase
        .from("fixtures")
        .select("id, league_id, date, home_team_id, away_team_id, status, goals")
        .eq("league_id", leagueId)
        .in("status", FINISHED_STATUSES) // only finished games
        .order("date", { ascending: false })
        .limit(fetchLimit);
      if (fixturesError) throw fixturesError;

      setFixtures(fixturesData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Build view-model per team: rank/points/GF/GA/GD/form from standings + last N fixtures from fixtures
  const teamsWithRecentMatches = useMemo(() => {
    if (!standings.length) return [];

    // Pre-index fixtures by team quickly
    const perTeam: Record<number, any[]> = {};
    const pushMatch = (teamId: number, m: any) => {
      if (!perTeam[teamId]) perTeam[teamId] = [];
      if (perTeam[teamId].length < MATCHES_PER_TEAM) perTeam[teamId].push(m);
    };

    // For each fixture (newest-first), push a match card for BOTH teams
    for (const fx of fixtures) {
      if (!fx.goals || typeof fx.goals.home !== "number" || typeof fx.goals.away !== "number") continue;

      const h = fx.home_team_id;
      const a = fx.away_team_id;
      const hg = fx.goals.home!;
      const ag = fx.goals.away!;
      const homeRes = hg > ag ? "W" : hg < ag ? "L" : "D";
      const awayRes = ag > hg ? "W" : ag < hg ? "L" : "D";

      // home team card
      pushMatch(h, {
        date: fx.date,
        opponentId: a,
        opponent: teamsMap.get(a)?.name || "Unknown",
        home: true,
        score: `${hg}-${ag}`,
        result: homeRes,
      });

      // away team card
      pushMatch(a, {
        date: fx.date,
        opponentId: h,
        opponent: teamsMap.get(h)?.name || "Unknown",
        home: false,
        score: `${ag}-${hg}`,
        result: awayRes,
      });

      // Early stop if all teams have enough matches (optional micro-opt)
      // if (Object.keys(perTeam).length >= standings.length && Object.values(perTeam).every(v => v.length >= MATCHES_PER_TEAM)) break;
    }

    // Merge with standings, keep table order by rank
    return standings.map((s) => {
      const team = teamsMap.get(s.team_id);
      // derive form from standings.form if present (fallback to last matches)
      const formFromStandings =
        (s.form || "")
          .slice(-5)
          .split("")
          .filter((c) => c === "W" || c === "D" || c === "L") || [];

      const matches = perTeam[s.team_id] || [];
      const formFromFixtures = matches.map((m) => m.result).slice(0, 5);

      return {
        id: s.team_id,
        rank: s.rank,
        name: team?.name || "Unknown Team",
        logo: team?.logo || null,
        points: s.points,
        goalsFor: s.goals_for,
        goalsAgainst: s.goals_against,
        goalDiff: s.goal_diff,
        // prefer form from standings; if missing, use fixtures-derived
        form: formFromStandings.length ? formFromStandings : formFromFixtures,
        matches, // already capped at MATCHES_PER_TEAM per team
      };
    });
  }, [standings, fixtures, teamsMap]);

  if (loading) return <Skeleton className="h-96 w-full" />;

  if (!teamsWithRecentMatches.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No standings/fixtures available for this league yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-full overflow-x-hidden">
      {/* Left: ALL teams with recent matches */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <div className="h-6 w-1 sm:h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold">Team Form & Recent Matches</h2>
        </div>

        {teamsWithRecentMatches.map((team, idx) => (
          <div
            key={team.id}
            className="group border rounded-xl p-3 sm:p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="grid place-items-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm sm:text-xl font-bold shrink-0">
                  {team.rank ?? idx + 1}
                </div>
                {!!team.logo && (
                  <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-background/50 p-1.5 sm:p-2 grid place-items-center shrink-0">
                    <img src={team.logo} alt={team.name} className="h-full w-full object-contain max-w-full" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold truncate">{team.name}</h3>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                    {team.form.slice(-5).map((r: string, i: number) => (
                      <div
                        key={i}
                        className={`h-5 w-5 sm:h-6 sm:w-6 rounded text-[10px] sm:text-[11px] font-bold grid place-items-center
                          ${
                            r === "W"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : r === "D"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 sm:gap-6 text-right shrink-0">
                <div>
                  <div className="text-lg sm:text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                    {team.points}
                  </div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">Points</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-semibold">
                    {team.goalsFor}:{team.goalsAgainst}
                  </div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">GF:GA</div>
                </div>
                <div>
                  <div
                    className={`text-sm sm:text-lg font-semibold ${team.goalDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {team.goalDiff >= 0 ? "+" : ""}
                    {team.goalDiff}
                  </div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">GD</div>
                </div>
              </div>
            </div>

            {/* Recent matches (3–5) */}
            <div className="overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <div className="flex gap-2 sm:grid sm:grid-cols-5 sm:gap-3 px-1 sm:px-0 snap-x snap-mandatory">
                {team.matches.map((m: any, i: number) => {
                  const win = m.result === "W";
                  const draw = m.result === "D";
                  return (
                    <div
                      key={i}
                      className={`relative shrink-0 w-[46%] xs:w-[42%] sm:w-auto snap-start overflow-hidden rounded-lg p-2 sm:p-3 border transition-all
                        ${
                          win
                            ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40"
                            : draw
                              ? "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
                              : "bg-red-500/10 border-red-500/20 hover:border-red-500/40"
                        }`}
                    >
                      <div className="text-[10px] text-muted-foreground mb-1 font-medium">
                        {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div className="text-[11px] sm:text-xs mb-1.5 sm:mb-2 line-clamp-2 h-7 sm:h-8">
                        <span className="text-muted-foreground">{m.home ? "vs" : "@"}</span> {m.opponent}
                      </div>
                      <div className="text-sm sm:text-base font-bold">{m.score}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right: FULL league table from standings */}
      <div className="space-y-4">
        <div className="border rounded-xl p-4 sm:p-6 bg-gradient-to-br from-card to-card/50 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-bold">League Table</h2>
          </div>

          <div className="space-y-1">
            {teamsWithRecentMatches.map((t) => {
              const top4 = t.rank <= 4;
              const rel = t.rank >= Math.max(teamsWithRecentMatches.length - 2, teamsWithRecentMatches.length - 2); // bottom 3 in full list if you want: t.rank >= (len-2)
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all hover:bg-accent/50"
                >
                  <div
                    className={`h-6 w-6 rounded text-[11px] font-bold grid place-items-center
                      ${top4 ? "bg-primary/20 text-primary" : rel ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"}`}
                  >
                    {t.rank}
                  </div>
                  {!!t.logo && (
                    <div className="h-6 w-6 rounded bg-background/50 p-0.5 grid place-items-center shrink-0">
                      <img src={t.logo} alt={t.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium truncate min-w-0">{t.name}</span>
                  <span className="text-sm font-bold shrink-0">{t.points}</span>
                </div>
              );
            })}
          </div>

          <Button
            variant="link"
            className="w-full mt-3 sm:mt-4 text-primary group"
            onClick={() => setActiveTab("table")}
          >
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
        const { data: teamsData } = await supabase.from("teams").select("*");

        const teamsMap = new Map<number, Team>();
        teamsData?.forEach((team) => {
          teamsMap.set(team.id, team);
        });
        setTeams(teamsMap);

        // Fetch top scorers from database (populated by sync function)
        const { data: scorersData, error } = await supabase
          .from("top_scorers")
          .select("*")
          .eq("league_id", leagueId)
          .order("goals", { ascending: false })
          .limit(20);

        if (error) throw error;

        setScorers(scorersData || []);
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
          const team = teams.get(scorer.team_id);
          return (
            <div
              key={scorer.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-card/50 backdrop-blur border border-border/50 hover:bg-accent/50 transition-colors"
            >
              <div className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-lg">{scorer.player_name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {team?.logo && (
                    <div className="h-4 w-4 rounded bg-background/50 p-0.5 flex items-center justify-center flex-shrink-0">
                      <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
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
                  <div className="text-xl font-semibold">{scorer.appearances}</div>
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
