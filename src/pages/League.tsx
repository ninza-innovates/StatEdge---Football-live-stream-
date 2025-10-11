import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Grid, List, Search, Trophy } from "lucide-react";

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

interface Fixture {
  id: number;
  date: string;
  home_team_id: number;
  away_team_id: number;
  status: string;
  goals: { home: number; away: number } | null;
  venue: string;
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
        .single();

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
            {activeTab === "fixtures" && <FixturesTab leagueId={league.id} />}
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
const FixturesTab = ({ leagueId }: { leagueId: number }) => {
  return (
    <div className="text-muted-foreground">
      Fixtures content for league {leagueId}
    </div>
  );
};

// Table Tab Component
const TableTab = ({ leagueId }: { leagueId: number }) => {
  return (
    <div className="text-muted-foreground">
      League table content for league {leagueId}
    </div>
  );
};

// Form Tab Component
const FormTab = ({ leagueId }: { leagueId: number }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagueName, setLeagueName] = useState("");

  useEffect(() => {
    fetchTeamForm();
  }, [leagueId]);

  const fetchTeamForm = async () => {
    try {
      // Fetch league name
      const { data: leagueData } = await supabase
        .from("leagues")
        .select("name")
        .eq("id", leagueId)
        .single();
      
      if (leagueData) {
        setLeagueName(leagueData.name);
      }

      // Mock data for now - will be replaced with real data
      const mockTeams = [
        {
          id: 1,
          name: "Bayern München",
          logo: "",
          position: 1,
          points: 15,
          goalDiff: 19,
          goalsFor: 22,
          goalsAgainst: 3,
          form: ["W", "W", "W", "W", "W"],
          lastMatches: [
            { date: "Sep 26", opponent: "Werder Bremen", home: true, score: "4-0" },
            { date: "Sep 20", opponent: "1899 Hoffenheim", home: false, score: "4-1" },
            { date: "Sep 13", opponent: "Hamburger SV", home: true, score: "5-0" },
            { date: "Aug 30", opponent: "FC Augsburg", home: false, score: "3-2" },
            { date: "Aug 22", opponent: "RB Leipzig", home: true, score: "6-0" },
          ],
        },
        {
          id: 2,
          name: "Borussia Dortmund",
          logo: "",
          position: 2,
          points: 13,
          goalDiff: 8,
          goalsFor: 11,
          goalsAgainst: 3,
          form: ["W", "W", "W", "W", "D"],
          lastMatches: [
            { date: "Sep 27", opponent: "FSV Mainz 05", home: false, score: "2-0" },
            { date: "Sep 21", opponent: "VfL Wolfsburg", home: true, score: "1-0" },
            { date: "Sep 13", opponent: "1. FC Heidenheim", home: false, score: "2-0" },
            { date: "Aug 31", opponent: "Union Berlin", home: true, score: "3-0" },
            { date: "Aug 23", opponent: "FC St. Pauli", home: false, score: "3-3" },
          ],
        },
      ];

      setTeams(mockTeams);
    } catch (error) {
      console.error("Error fetching team form:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Team Form Analysis - Left side (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h2 className="text-xl font-semibold">Team Form Analysis</h2>
        </div>

        {teams.map((team) => (
          <div key={team.id} className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-muted-foreground">{team.position}</span>
                <Trophy className="h-4 w-4 text-yellow-500" />
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="h-8 w-8" />
                  ) : (
                    <span className="text-xs font-bold">{team.name.substring(0, 2)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-xs text-muted-foreground">{leagueName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-3">
                  <div>
                    <div className="text-2xl font-bold">{team.points}</div>
                    <div className="text-xs text-muted-foreground">PTS</div>
                  </div>
                  <div>
                    <div className="text-lg">{team.goalsFor}:{team.goalsAgainst}</div>
                    <div className="text-xs text-muted-foreground">GF:GA</div>
                  </div>
                  <div className="text-emerald-500">
                    <div className="text-lg">+{team.goalDiff}</div>
                    <div className="text-xs text-muted-foreground">GD</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Last 5 Matches</p>
              <div className="grid grid-cols-5 gap-2">
                {team.lastMatches.map((match: any, idx: number) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 ${
                      match.score.startsWith("0-") || match.score.endsWith("-0")
                        ? "bg-emerald-950/30 border border-emerald-900/50"
                        : match.score.includes("3-3")
                        ? "bg-amber-950/30 border border-amber-900/50"
                        : "bg-emerald-950/30 border border-emerald-900/50"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">{match.date}</div>
                    <div className="text-xs mb-1 flex items-center gap-1">
                      {match.home ? "vs" : "@"} <span className="truncate">{match.opponent}</span>
                    </div>
                    <div className="text-sm font-semibold">{match.score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Form:</span>
              {team.form.map((result: string, idx: number) => (
                <div
                  key={idx}
                  className={`h-6 w-6 rounded flex items-center justify-center text-xs font-semibold ${
                    result === "W"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : result === "D"
                      ? "bg-amber-500/20 text-amber-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* League Table - Right side (1/3) */}
      <div className="space-y-6">
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">League Table</h2>
          </div>

          <div className="space-y-2">
            {teams.map((team, idx) => (
              <div key={team.id} className="flex items-center gap-3 py-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-sm font-semibold">
                  {idx + 1}
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="h-6 w-6" />
                  ) : (
                    <span className="text-xs font-bold">{team.name.substring(0, 2)}</span>
                  )}
                </div>
                <span className="flex-1 text-sm font-medium">{team.name}</span>
                <span className="text-sm font-bold">{team.points}</span>
              </div>
            ))}
          </div>

          <Button variant="link" className="w-full mt-4 text-primary">
            View Full Table →
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h3 className="font-semibold mb-4">League Form</h3>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(25)].map((_, idx) => (
              <div key={idx} className="h-8 w-8 rounded bg-muted/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Top Scorers Tab Component
const ScorersTab = ({ leagueId }: { leagueId: number }) => {
  return (
    <div className="text-muted-foreground">
      Top scorers content for league {leagueId}
    </div>
  );
};

export default League;
