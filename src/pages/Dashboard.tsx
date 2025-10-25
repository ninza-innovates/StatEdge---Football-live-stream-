import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { DateTime } from "luxon"; // npm i luxon
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Heart, Eye, MapPin, Trophy } from "lucide-react";

type Team = { id: number; name: string; logo?: string | null };

type FixtureRow = {
  id: number;
  league_id: number;
  date: string; // timestamptz
  home_team_id: number;
  away_team_id: number;
  venue: string | null;
  status: string;
  goals: { home?: number; away?: number } | null;
};

type StandingRow = {
  team_id: number;
  rank: number;
  points: number;
  goals_for: number;
  goals_against: number;
  played: number;
  form: string | null;
};

type LeagueRow = {
  id: number;
  name: string;
  logo?: string | null;
  slug?: string | null;
  country?: string | null;
  order_index?: number | null;
};

type Insight = {
  tag: "Classic Rivalry" | "Big Match" | "Upset Watch" | "Hot Form" | "High Scoring";
  title: string;
  heat: number; // 0..100
  fixture: FixtureRow;
};

const Dashboard = () => {
  const { user } = useAuth();

  // Data state
  const [teamsMap, setTeamsMap] = useState<Map<number, Team>>(new Map());
  const [leaguesMap, setLeaguesMap] = useState<Map<number, LeagueRow>>(new Map());
  const [fixturesToday, setFixturesToday] = useState<FixtureRow[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);

  // UI/FX state
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [fixturesError, setFixturesError] = useState<string | null>(null);

  // (Optional) Jump to fixtures when user clicks hero button
  const fixturesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingFixtures(true);
      setFixturesError(null);
      try {
        // Resolve user's local timezone -> compute today's window -> convert to UTC
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const startUTC = DateTime.now().setZone(tz).startOf("day").toUTC().toISO();
        const endUTC = DateTime.now().setZone(tz).endOf("day").toUTC().toISO();

        // Teams (for names/logos)
        const { data: teamsData, error: teamsErr } = await supabase
          .from("teams")
          .select("id,name,logo");
        if (teamsErr) throw teamsErr;
        const tMap = new Map<number, Team>();
        (teamsData || []).forEach((t) => tMap.set(t.id, t as Team));
        setTeamsMap(tMap);

        // Leagues (for league name/logo)
        const { data: leaguesData, error: leaguesErr } = await supabase
          .from("leagues")
          .select("id,name,logo,slug,country,order_index");
        if (leaguesErr) throw leaguesErr;
        const lMap = new Map<number, LeagueRow>();
        (leaguesData || []).forEach((l) => lMap.set(l.id, l as LeagueRow));
        setLeaguesMap(lMap);

        // Standings (for ranks/form to power insights)
        const { data: standingsData, error: standingsErr } = await supabase
          .from("standings")
          .select("team_id, rank, points, goals_for, goals_against, played, form")
          .order("rank", { ascending: true });
        if (standingsErr) throw standingsErr;
        setStandings((standingsData || []) as StandingRow[]);

        // Today's fixtures (inclusive window)
        const { data: fxData, error: fxErr } = await supabase
          .from("fixtures")
          .select("id, league_id, date, home_team_id, away_team_id, venue, status, goals")
          .gte("date", startUTC!)
          .lte("date", endUTC!)
          .order("date", { ascending: true });
        if (fxErr) throw fxErr;
        setFixturesToday((fxData || []) as FixtureRow[]);
      } catch (e: any) {
        console.error(e);
        setFixturesError(e?.message || "Failed to load today’s fixtures");
      } finally {
        setLoadingFixtures(false);
      }
    };

    fetchAll();
  }, []);

  // === Featured Insights (simple, explainable heuristics) ===
  const insights = useMemo<Insight[]>(() => {
    if (!fixturesToday.length || !standings.length) return [];

    const rankOf = (id: number) => standings.find((s) => s.team_id === id)?.rank ?? 99;
    const formScore = (id: number) =>
      (standings.find((s) => s.team_id === id)?.form || "")
        .split("")
        .reduce((acc, c) => acc + (c === "W" ? 1 : c === "D" ? 0.5 : 0), 0);

    const avgGoalsPerGame = (id: number) => {
      const s = standings.find((x) => x.team_id === id);
      if (!s || !s.played) return 0;
      return (s.goals_for + s.goals_against) / s.played;
    };

    const out: Insight[] = [];

    for (const fx of fixturesToday) {
      const r1 = rankOf(fx.home_team_id);
      const r2 = rankOf(fx.away_team_id);
      const diff = Math.abs(r1 - r2);
      const f1 = formScore(fx.home_team_id);
      const f2 = formScore(fx.away_team_id);
      const g1 = avgGoalsPerGame(fx.home_team_id);
      const g2 = avgGoalsPerGame(fx.away_team_id);

      // 1) Big Match: both inside top 6
      if (r1 <= 6 && r2 <= 6) {
        out.push({ tag: "Big Match", title: "Top-table clash", heat: 95, fixture: fx });
      }

      // 2) Upset Watch: rank gap is big (>=8)
      if (diff >= 8) {
        out.push({ tag: "Upset Watch", title: "Potential upset on the cards", heat: 88, fixture: fx });
      }

      // 3) Hot Form: combined recent form strong (>=7)
      if (f1 + f2 >= 7) {
        out.push({ tag: "Hot Form", title: "Both teams in great form", heat: 92, fixture: fx });
      }

      // 4) High Scoring: high avg goals per game
      if (g1 + g2 >= 5.6 /* ~2.8 each */) {
        out.push({ tag: "High Scoring", title: "Likely to see goals", heat: 86, fixture: fx });
      }
    }

    // Deduplicate by fixture id, keep spiciest tag first
    const bestByFx = new Map<number, Insight>();
    for (const ins of out.sort((a, b) => b.heat - a.heat)) {
      if (!bestByFx.has(ins.fixture.id)) bestByFx.set(ins.fixture.id, ins);
    }

    return [...bestByFx.values()].slice(0, 3);
  }, [fixturesToday, standings]);

  // Group fixtures by league
  const fixturesByLeague = useMemo(() => {
    const grouped = new Map<number, FixtureRow[]>();
    fixturesToday.forEach((fx) => {
      const existing = grouped.get(fx.league_id) || [];
      existing.push(fx);
      grouped.set(fx.league_id, existing);
    });
    // Sort leagues by their order_index (same as sidebar)
    return Array.from(grouped.entries()).sort((a, b) => {
      const leagueA = leaguesMap.get(a[0]);
      const leagueB = leaguesMap.get(b[0]);
      const orderA = leagueA?.order_index ?? 999;
      const orderB = leagueB?.order_index ?? 999;
      return orderA - orderB;
    });
  }, [fixturesToday, leaguesMap]);

  const scrollToFixtures = () => {
    fixturesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | StatEdge</title>
      </Helmet>

      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />

          <SidebarInset className="flex-1">
            {/* Header with Trigger */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
              <SidebarTrigger />
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 space-y-6">
              {/* Welcome Hero Banner */}
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/20 via-purple-600/20 to-primary/20 p-6 md:p-8 border border-primary/30">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
                    </h1>
                    <p className="text-muted-foreground">Your AI insights for today are ready.</p>
                  </div>
                  <Button variant="hero" size="lg" className="shrink-0" onClick={scrollToFixtures}>
                    View Today&apos;s Matches
                  </Button>
                </div>
              </div>

              {/* Filters Section (UI only; wire up later if needed) */}
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                {/* Date Filter */}
                <Select defaultValue="today" disabled>
                  <SelectTrigger className="w-full md:w-[140px] bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow" disabled>Tomorrow</SelectItem>
                    <SelectItem value="week" disabled>This Week</SelectItem>
                  </SelectContent>
                </Select>

                {/* League Filter */}
                <Select defaultValue="all" disabled>
                  <SelectTrigger className="w-full md:w-[160px] bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leagues</SelectItem>
                    <SelectItem value="premier-league">Premier League</SelectItem>
                    <SelectItem value="la-liga">La Liga</SelectItem>
                    <SelectItem value="bundesliga">Bundesliga</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="flex-1 w-full md:max-w-md">
                  <Input placeholder="Search teams..." className="bg-card border-border" disabled />
                </div>

                {/* All / Favourites Tabs */}
                <div className="flex gap-2 ml-auto">
                  <Button variant="hero" size="sm">All</Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Favourites
                  </Button>
                </div>
              </div>

              {/* Featured Insights (data-driven) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-primary rounded"></div>
                  <h2 className="text-xl font-bold text-foreground">Featured Insights</h2>
                </div>

                {insights.length === 0 ? (
                  <Card className="glass-card p-6 text-sm text-muted-foreground">
                    No standout matches detected today — check back later.
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {insights.map((ins) => {
                      const home = teamsMap.get(ins.fixture.home_team_id);
                      const away = teamsMap.get(ins.fixture.away_team_id);
                      const league = leaguesMap.get(ins.fixture.league_id);
                      const when = new Date(ins.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      return (
                        <Card key={ins.fixture.id} className="glass-card hover-lift p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <Flame className="h-5 w-5" />
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{ins.tag}</Badge>
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 ml-auto">
                              {Math.round(ins.heat)}°C
                            </Badge>
                          </div>

                          <div>
                            <h3 className="font-bold text-foreground mb-1">
                              {home?.name || "Home"} vs {away?.name || "Away"}
                            </h3>
                            <p className="text-muted-foreground text-sm">{ins.title}</p>
                            <div className="mt-2 text-xs text-muted-foreground flex flex-col items-start gap-3 flex-wrap">
                              <span className="inline-flex items-start gap-1">
                                <Calendar className="h-3 w-3" />
                                Today at {when}
                              </span>
                              {league && (
                                <span className="inline-flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {league.logo ? (
                                    <img
                                      src={league.logo}
                                      alt={league.name}
                                      className="h-3.5 w-3.5 object-contain inline-block"
                                    />
                                  ) : null}
                                  <span>{league.name}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <Button variant="hero" className="w-full" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Match
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Today's Fixtures */}
              <div ref={fixturesRef}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-primary rounded"></div>
                  <h2 className="text-xl font-bold text-foreground">Today&apos;s Fixtures</h2>
                </div>

                {loadingFixtures ? (
                  <Card className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[200px]">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">Loading today’s fixtures…</p>
                  </Card>
                ) : fixturesError ? (
                  <Card className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[200px]">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">{fixturesError}</p>
                  </Card>
                ) : fixturesToday.length === 0 ? (
                  <Card className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[200px]">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">No matches found for the selected filters</p>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {fixturesByLeague.map(([leagueId, fixtures]) => {
                      const league = leaguesMap.get(leagueId);
                      return (
                        <div key={leagueId} className="space-y-4">
                          {/* League Header */}
                          <div className="flex items-center gap-3 pb-2 border-b border-border">
                            {league?.logo && (
                              <img
                                src={league.logo}
                                alt={league.name}
                                className="h-6 w-6 object-contain"
                              />
                            )}
                            <h3 className="text-lg font-semibold text-foreground">
                              {league?.name || `League ${leagueId}`}
                            </h3>
                            <Badge variant="outline" className="ml-2">
                              {fixtures.length} {fixtures.length === 1 ? 'match' : 'matches'}
                            </Badge>
                          </div>

                          {/* Fixtures Grid */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {fixtures.map((fx) => {
                              const home = teamsMap.get(fx.home_team_id);
                              const away = teamsMap.get(fx.away_team_id);
                              const localDate = new Date(fx.date);
                              const timeStr = localDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                              const dayStr = localDate.toLocaleDateString([], { month: "short", day: "numeric" });

                              return (
                                <Card key={fx.id} className="glass-card hover-lift p-5 space-y-4">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                      {fx.status || "Scheduled"}
                                    </Badge>
                                    {fx.goals && typeof fx.goals.home === "number" && typeof fx.goals.away === "number" ? (
                                      <Badge className="ml-auto bg-primary/20 text-primary border-primary/30">
                                        {fx.goals.home} : {fx.goals.away}
                                      </Badge>
                                    ) : null}
                                  </div>

                                  <div>
                                    <h3 className="font-bold text-foreground mb-2">
                                      {home?.name || "Home"} vs {away?.name || "Away"}
                                    </h3>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{dayStr} at {timeStr}</span>
                                      </div>
                                      {fx.venue ? (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-3 w-3" />
                                          <span>{fx.venue}</span>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>

                                  <Button variant="hero" className="w-full" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Match
                                  </Button>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Dashboard;
