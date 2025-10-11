import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FavouriteFixture {
  id: string;
  fixture_id: number;
  fixture: {
    id: number;
    home_team: { name: string; logo: string };
    away_team: { name: string; logo: string };
    league: { name: string };
    date: string;
    status: string;
    goals: { home: number; away: number } | null;
  };
}

export default function Favourites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favourites, setFavourites] = useState<FavouriteFixture[]>([]);
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

      // Fetch team and league details for each fixture
      const enrichedData = await Promise.all(
        (data || []).map(async (fav: any) => {
          const fixture = fav.fixtures;
          
          const [homeTeam, awayTeam, league] = await Promise.all([
            supabase.from('teams').select('name, logo').eq('id', fixture.home_team_id).single(),
            supabase.from('teams').select('name, logo').eq('id', fixture.away_team_id).single(),
            supabase.from('leagues').select('name').eq('id', fixture.league_id).single(),
          ]);

          return {
            id: fav.id,
            fixture_id: fav.fixture_id,
            fixture: {
              id: fixture.id,
              home_team: homeTeam.data,
              away_team: awayTeam.data,
              league: league.data,
              date: fixture.date,
              status: fixture.status,
              goals: fixture.goals,
            },
          };
        })
      );

      setFavourites(enrichedData);
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Favourites</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading favourites...</div>
        ) : favourites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No favourites yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding matches to your favourites to see them here
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Browse Matches
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {favourites.map((fav) => (
              <Card key={fav.id} className="hover:border-primary/50 transition-colors">
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
                        <img 
                          src={fav.fixture.home_team.logo} 
                          alt={fav.fixture.home_team.name}
                          className="h-8 w-8 object-contain"
                        />
                        <span className="font-semibold">{fav.fixture.home_team.name}</span>
                      </div>
                      
                      <div className="text-center px-4">
                        {fav.fixture.status === 'FT' && fav.fixture.goals ? (
                          <div className="text-2xl font-bold">
                            {fav.fixture.goals.home} - {fav.fixture.goals.away}
                          </div>
                        ) : (
                          <Badge>{fav.fixture.status}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-semibold">{fav.fixture.away_team.name}</span>
                        <img 
                          src={fav.fixture.away_team.logo} 
                          alt={fav.fixture.away_team.name}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDate(fav.fixture.date)}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/match/${fav.fixture_id}`)}
                    >
                      View Match
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
