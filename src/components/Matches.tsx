import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Flame, Calendar, MapPin, Trophy, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Fixture {
  id: number;
  home_team_id: number;
  away_team_id: number;
  league_id: number;
  date: string;
  venue: string;
  status: string;
  home_team: { name: string };
  away_team: { name: string };
  league: { name: string };
}

const Matches = () => {
  const [featuredMatches, setFeaturedMatches] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedMatches();
  }, []);

  const fetchFeaturedMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          id,
          home_team_id,
          away_team_id,
          league_id,
          date,
          venue,
          status,
          home_team:teams!fixtures_home_team_id_fkey(name),
          away_team:teams!fixtures_away_team_id_fkey(name),
          league:leagues(name)
        `)
        .eq('status', 'NS')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;
      
      const transformedData = (data || []).map((fixture: any) => ({
        id: fixture.id,
        home_team_id: fixture.home_team_id,
        away_team_id: fixture.away_team_id,
        league_id: fixture.league_id,
        date: fixture.date,
        venue: fixture.venue,
        status: fixture.status,
        home_team: Array.isArray(fixture.home_team) ? fixture.home_team[0] : fixture.home_team,
        away_team: Array.isArray(fixture.away_team) ? fixture.away_team[0] : fixture.away_team,
        league: Array.isArray(fixture.league) ? fixture.league[0] : fixture.league,
      }));
      
      setFeaturedMatches(transformedData);
    } catch (error) {
      console.error('Error fetching featured matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMatch = () => {
    navigate('/auth');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (loading) {
    return (
      <section id="matches" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
            Featured Matches
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card p-5 space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="matches" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-1 w-8 bg-primary rounded"></div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center">
            Featured Matches
          </h2>
          <div className="h-1 w-8 bg-primary rounded"></div>
        </div>
        <p className="text-center text-muted-foreground mb-16">
          Get AI-powered insights on upcoming matches. Sign up to unlock detailed analysis.
        </p>
        
        {featuredMatches.length === 0 ? (
          <Card className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No upcoming matches available</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredMatches.map((match) => (
              <Card key={match.id} className="glass-card hover-lift p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                    Upcoming
                  </Badge>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 ml-auto">
                    AI Ready
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-foreground mb-2">
                    {match.home_team.name} vs {match.away_team.name}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(match.date)} at {formatTime(match.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{match.venue || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3 w-3" />
                      <span>{match.league.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-foreground font-medium">{match.home_team.name}</span>
                    <span>vs</span>
                    <span className="text-foreground font-medium">{match.away_team.name}</span>
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full" 
                  size="sm"
                  onClick={handleViewMatch}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Sign Up to View Insights
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Matches;