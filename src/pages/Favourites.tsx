import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateMatchSlug } from "@/utils/matchSlug";
import {
  readFavouriteFixture,
  toFavouriteCard,
  type FavouriteCard,
  type FavouriteFixtureSource,
} from "@/utils/favourites";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

/**
 * Prefer the live fixture joined from `fixtures`.
 * Sync moves finished matches into `fixtures_archive` and deletes the live row,
 * which used to throw while mapping favourites and hide every saved match.
 */
async function loadFavouriteFixture(
  fixtureId: number | null,
  joined: unknown,
): Promise<FavouriteFixtureSource | null> {
  const live = readFavouriteFixture(joined);
  if (live) return live;
  if (fixtureId == null) return null;

  const { data, error } = await supabase
    .from("fixtures_archive")
    .select("id, home_team_id, away_team_id, league_id, date, status, goals")
    .eq("id", fixtureId)
    .maybeSingle();

  if (error) {
    console.error("Error loading archived favourite:", error);
    return null;
  }

  return readFavouriteFixture(data);
}

export default function Favourites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favourites, setFavourites] = useState<FavouriteCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavourites();
    }
  }, [user]);

  const fetchFavourites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          fixture_id,
          fixtures (
            id,
            home_team_id,
            away_team_id,
            league_id,
            date,
            status,
            goals
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cards = await Promise.all(
        (data || []).map(async (fav) => {
          const fixture = await loadFavouriteFixture(fav.fixture_id, fav.fixtures);
          if (!fixture) return null;

          const [homeTeam, awayTeam, league] = await Promise.all([
            supabase.from("teams").select("name, logo").eq("id", fixture.home_team_id).maybeSingle(),
            supabase.from("teams").select("name, logo").eq("id", fixture.away_team_id).maybeSingle(),
            supabase.from("leagues").select("name").eq("id", fixture.league_id).maybeSingle(),
          ]);

          if (homeTeam.error) throw homeTeam.error;
          if (awayTeam.error) throw awayTeam.error;
          if (league.error) throw league.error;

          return toFavouriteCard({
            id: fav.id,
            fixture,
            homeTeam: homeTeam.data,
            awayTeam: awayTeam.data,
            leagueName: league.data?.name,
          });
        }),
      );

      setFavourites(cards.filter((card): card is FavouriteCard => card !== null));
    } catch (error) {
      console.error('Error fetching favourites:', error);
      toast({
        title: "Error",
        description: "Failed to load favourites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavourite = async (favouriteId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favouriteId);

      if (error) throw error;

      setFavourites(favourites.filter(f => f.id !== favouriteId));
      toast({
        title: "Removed",
        description: "Match removed from favourites",
      });
    } catch (error) {
      console.error('Error removing favourite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favourite",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Helmet>
        <title>Favourites | StatEdge</title>
      </Helmet>

      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
        
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">My Favourites</h1>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading favourites...</div>
            ) : favourites.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No favourites yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding matches to your favourites to see them here
                  </p>
                  <Button variant="hero" onClick={() => navigate('/dashboard')}>
                    Browse Matches
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {favourites.map((fav) => (
                  <Card key={fav.id} className="glass-card hover-lift">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{fav.fixture.league.name}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFavourite(fav.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2 flex-1">
                            {fav.fixture.home_team.logo ? (
                              <img
                                src={fav.fixture.home_team.logo}
                                alt={fav.fixture.home_team.name}
                                className="h-8 w-8 object-contain"
                              />
                            ) : null}
                            <span className="font-semibold">{fav.fixture.home_team.name}</span>
                          </div>
                          
                          <div className="text-center px-4">
                            {FINISHED_STATUSES.has(fav.fixture.status) && fav.fixture.goals ? (
                              <div className="text-2xl font-bold">
                                {fav.fixture.goals.home} - {fav.fixture.goals.away}
                              </div>
                            ) : (
                              <Badge>{fav.fixture.status}</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="font-semibold">{fav.fixture.away_team.name}</span>
                            {fav.fixture.away_team.logo ? (
                              <img
                                src={fav.fixture.away_team.logo}
                                alt={fav.fixture.away_team.name}
                                className="h-8 w-8 object-contain"
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatDate(fav.fixture.date)}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/match/${generateMatchSlug(fav.fixture.home_team.name, fav.fixture.away_team.name)}`)}
                        >
                          View Match
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </>
  );
}
