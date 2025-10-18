import { useState, useEffect } from "react";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
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
  const { isSubscribed } = useSubscription();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId, user]);

  const fetchFixtures = async () => {
    try {
      const { data: fixturesData, error: fixturesError } = await supabase
        .from("fixtures")
        .select("*, goals")
        .eq("league_id", leagueId)
        .eq("status", "NS")
        .order("date", { ascending: true })
        .limit(4);

      if (fixturesError) throw fixturesError;

      const { data: teamsData, error: teamsError } = await supabase.from("teams").select("*");
      if (teamsError) throw teamsError;

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
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("fixture_id", fixtureId);
        if (error) throw error;

        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(fixtureId);
          return next;
        });

        toast({ title: "Removed from favorites", description: "Match removed from your favorites" });
      } else {
        const { error } = await supabase.from("user_favorites").insert({ user_id: user.id, fixture_id: fixtureId });
        if (error) throw error;

        setFavorites((prev) => new Set(prev).add(fixtureId));
        toast({ title: "Added to favorites", description: "Match added to your favorites" });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({ title: "Error", description: "Failed to update favorites", variant: "destructive" });
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
              className="border rounded-xl lg:p-6 p-3 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {fixtureDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-xs sm:text-sm font-medium">
                  {fixtureDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 items-center">
                {/* Home Team */}
                <div className="flex items-center gap-2 sm:gap-4 justify-end">
                  <div className="text-right">
                    <h3 className="text-sm sm:text-base font-bold">{homeTeam?.name || "Unknown"}</h3>
                  </div>
                  {homeTeam?.logo && (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-background/50 p-1 sm:p-2 flex items-center justify-center flex-shrink-0">
                      <img src={homeTeam.logo} alt={homeTeam.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Score or VS */}
                <div className="flex items-center justify-center min-w-[40px] sm:min-w-[60px] lg:min-w-[80px]">
                  {fixture.status === "FT" && hasScore ? (
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                      {fixture.goals.home} - {fixture.goals.away}
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-muted-foreground">VS</div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {awayTeam?.logo && (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-background/50 p-1 sm:p-2 flex items-center justify-center flex-shrink-0">
                      <img src={awayTeam.logo} alt={awayTeam.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold">{awayTeam?.name || "Unknown"}</h3>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4">
                {fixture.venue && (
                  <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    <span>📍</span>
                    <span className="truncate">{fixture.venue}</span>
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
        <div className="border rounded-xl p-6 bg-gradient-to-br from-card to-card/50 top-6">
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

// Table Tab Component (mobile-optimized)
const TableTab = ({ leagueId }: { leagueId: number }) => {
  const [standings, setStandings] = useState<any[]>([]);
  const [teams, setTeams] = useState<Map<number, Team>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const { data: teamsData } = await supabase.from("teams").select("*");

        const teamsMap = new Map<number, Team>();
        teamsData?.forEach((team) => {
          teamsMap.set(team.id, team);
        });
        setTeams(teamsMap);

        const { data: standingsData, error } = await supabase
          .from("standings")
          .select("*")
          .eq("league_id", leagueId)
          .order("rank", { ascending: true });

        if (error) throw error;
        setStandings(standingsData || []);
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
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile cards */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {standings.map((standing, index) => {
          const team = teams.get(standing.team_id);
          const top4 = index < 4;
          const europa = index >= 4 && index < 6;
          const relegation = index >= standings.length - 3;

          return (
            <div
              key={standing.team_id}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 bg-card/60
              ${top4 ? "ring-1 ring-primary/20" : ""}
              ${europa ? "ring-1 ring-blue-500/15" : ""}
              ${relegation ? "ring-1 ring-red-500/15" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-7 w-7 shrink-0 rounded text-xs font-bold grid place-items-center
                    ${top4 ? "bg-primary/20 text-primary" : relegation ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"}`}
                >
                  {standing.rank}
                </div>

                {team?.logo && (
                  <div className="h-7 w-7 shrink-0 rounded bg-background/50 p-0.5 grid place-items-center">
                    <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{team?.name || "Unknown"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    P{standing.played} • W{standing.win} D{standing.draw} L{standing.lose} • GD{" "}
                    {standing.goal_diff > 0 ? `+${standing.goal_diff}` : standing.goal_diff}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-semibold">{standing.points}</div>
                <div className="text-[11px] text-muted-foreground">Pts</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground">
                <th className="text-left py-3 px-3 font-semibold">#</th>
                <th className="text-left py-3 px-3 font-semibold">Team</th>
                <th className="text-center py-3 px-3 font-semibold">P</th>
                <th className="text-center py-3 px-3 font-semibold">W</th>
                <th className="text-center py-3 px-3 font-semibold">D</th>
                <th className="text-center py-3 px-3 font-semibold">L</th>
                <th className="text-center py-3 px-3 font-semibold">GF</th>
                <th className="text-center py-3 px-3 font-semibold">GA</th>
                <th className="text-center py-3 px-3 font-semibold">GD</th>
                <th className="text-center py-3 px-3 font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => {
                const team = teams.get(standing.team_id);
                const rowTint =
                  index < 4
                    ? "bg-emerald-500/5"
                    : index < 6
                      ? "bg-blue-500/5"
                      : index >= standings.length - 3
                        ? "bg-red-500/5"
                        : "";

                return (
                  <tr key={standing.team_id} className={`border-b hover:bg-accent/50 transition-colors ${rowTint}`}>
                    <td className="py-3 px-3 font-medium">{standing.rank}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {team?.logo && (
                          <div className="h-6 w-6 rounded bg-background/50 p-0.5 grid place-items-center">
                            <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
                          </div>
                        )}
                        <span className="font-medium truncate">{team?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3">{standing.played}</td>
                    <td className="text-center py-3 px-3">{standing.win}</td>
                    <td className="text-center py-3 px-3">{standing.draw}</td>
                    <td className="text-center py-3 px-3">{standing.lose}</td>
                    <td className="text-center py-3 px-3">{standing.goals_for}</td>
                    <td className="text-center py-3 px-3">{standing.goals_against}</td>
                    <td className="text-center py-3 px-3 font-medium">
                      {standing.goal_diff > 0 ? "+" : ""}
                      {standing.goal_diff}
                    </td>
                    <td className="text-center py-3 px-3 font-bold">{standing.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
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
    </div>
  );
};

// Form Tab Component (mobile-optimized)
const FormTab = ({ leagueId }: { leagueId: number }) => {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [teams, setTeams] = useState<Map<number, Team>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  const fetchRealData = async () => {
    try {
      const { data: fixturesData, error: fixturesError } = await supabase
        .from("fixtures")
        .select("*, goals")
        .eq("league_id", leagueId)
        .order("date", { ascending: false })
        .limit(120);

      if (fixturesError) throw fixturesError;

      const { data: teamsData, error: teamsError } = await supabase.from("teams").select("*");
      if (teamsError) throw teamsError;

      const teamsMap = new Map<number, Team>();
      teamsData?.forEach((team) => {
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

  const calculateTeamStats = () => {
    const teamStats = new Map<number, any>();

    fixtures.forEach((fixture) => {
      if (!fixture.goals) return;

      const homeTeamId = fixture.home_team_id;
      const awayTeamId = fixture.away_team_id;
      const homeGoals = fixture.goals.home;
      const awayGoals = fixture.goals.away;

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

      homeStats.goalsFor += homeGoals;
      homeStats.goalsAgainst += awayGoals;
      awayStats.goalsFor += awayGoals;
      awayStats.goalsAgainst += homeGoals;

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

    const statsArray = Array.from(teamStats.values())
      .map((stat) => ({
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
      {/* Left: Team Form (2/3 on lg) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <div className="h-6 w-1 sm:h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold">Team Form Analysis</h2>
        </div>

        {topTeams.slice(0, 5).map((team, idx) => {
          const teamData = teams.get(team.id);
          return (
            <div
              key={team.id}
              className="group border rounded-xl p-3 sm:p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm sm:text-xl font-bold shrink-0">
                    {idx + 1}
                  </div>
                  {teamData?.logo && (
                    <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-background/50 p-1.5 sm:p-2 grid place-items-center shrink-0">
                      <img src={teamData.logo} alt={teamData.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold truncate">{teamData?.name || "Unknown Team"}</h3>
                    {/* Form chips */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                      {team.form.map((result: string, formIdx: number) => (
                        <div
                          key={formIdx}
                          className={`h-5 w-5 sm:h-6 sm:w-6 rounded text-[10px] sm:text-[11px] font-bold grid place-items-center
                            ${
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

                {/* Key numbers */}
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

              {/* Last 5 matches — horizontal scroll on mobile */}
              <div className="overflow-x-auto -mx-1 sm:mx-0 pb-1 sm:pb-0">
                <div className="flex gap-2 sm:grid sm:grid-cols-5 sm:gap-3 px-1 sm:px-0 snap-x snap-mandatory">
                  {team.matches.map((match: any, matchIdx: number) => {
                    const isWin = match.result === "W";
                    const isDraw = match.result === "D";
                    return (
                      <div
                        key={matchIdx}
                        className={`relative shrink-0 w-[46%] sm:w-auto snap-start overflow-hidden rounded-lg p-2 sm:p-3 border transition-all
                          ${
                            isWin
                              ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40"
                              : isDraw
                                ? "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
                                : "bg-red-500/10 border-red-500/20 hover:border-red-500/40"
                          }`}
                      >
                        <div className="text-[10px] text-muted-foreground mb-1 font-medium">
                          {new Date(match.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="text-[11px] sm:text-xs mb-1.5 sm:mb-2 line-clamp-2 h-7 sm:h-8">
                          <span className="text-muted-foreground">{match.home ? "vs" : "@"}</span> {match.opponent}
                        </div>
                        <div className="text-sm sm:text-base font-bold">{match.score}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: League Table preview (full width on mobile) */}
      <div className="space-y-4">
        <div className="border rounded-xl p-4 sm:p-6 bg-gradient-to-br from-card to-card/50 sticky top-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-bold">League Table</h2>
          </div>

          <div className="space-y-1">
            {topTeams.slice(0, 10).map((team, idx) => {
              const teamData = teams.get(team.id);
              const isTopFour = idx < 4;
              const isRelegation = idx >= topTeams.length - 3;

              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all hover:bg-accent/50
                    ${isTopFour ? "bg-primary/5" : ""}`}
                >
                  <div
                    className={`h-6 w-6 rounded text-[11px] font-bold grid place-items-center
                      ${isTopFour ? "bg-primary/20 text-primary" : isRelegation ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"}`}
                  >
                    {idx + 1}
                  </div>
                  {teamData?.logo && (
                    <div className="h-6 w-6 rounded bg-background/50 p-0.5 grid place-items-center">
                      <img src={teamData.logo} alt={teamData.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium truncate">{teamData?.name || "Unknown"}</span>
                  <span className="text-sm font-bold">{team.points}</span>
                </div>
              );
            })}
          </div>

          <Button variant="link" className="w-full mt-3 sm:mt-4 text-primary group">
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
        const { data: teamsData } = await supabase.from("teams").select("*");

        const teamsMap = new Map<number, Team>();
        teamsData?.forEach((team) => {
          teamsMap.set(team.id, team);
        });
        setTeams(teamsMap);

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

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-lg truncate">{scorer.player_name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {team?.logo && (
                    <div className="h-4 w-4 rounded bg-background/50 p-0.5 flex items-center justify-center flex-shrink-0">
                      <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <span className="truncate">{team?.name || "Unknown"}</span>
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
