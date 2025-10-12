import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamsComparisonProps {
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  keyStats?: {
    home_form?: string[];
    away_form?: string[];
    h2h_record?: {
      home_wins: number;
      away_wins: number;
      draws: number;
    };
  };
}

export function TeamsComparison({ homeTeam, awayTeam, keyStats }: TeamsComparisonProps) {
  const getFormBadge = (result: string) => {
    if (result === 'W') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 min-w-6 justify-center">W</Badge>;
    }
    if (result === 'L') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 min-w-6 justify-center">L</Badge>;
    }
    return <Badge variant="outline" className="min-w-6 justify-center">D</Badge>;
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-card to-card/50">
      <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-center">
        {/* Home Team */}
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <img 
            src={homeTeam.logo} 
            alt={homeTeam.name}
            className="h-16 w-16 sm:h-24 sm:w-24 object-contain"
          />
          <h1 className="text-lg sm:text-2xl font-bold break-words max-w-full">{homeTeam.name}</h1>
          {keyStats?.home_form && keyStats.home_form.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Recent Form</p>
              <div className="flex gap-1 justify-center">
                {keyStats.home_form.slice(0, 5).map((result, i) => (
                  <div key={i}>{getFormBadge(result)}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* VS & H2H */}
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 order-first md:order-none">
          <div className="text-3xl sm:text-4xl font-bold text-muted-foreground">VS</div>
          
          {keyStats?.h2h_record && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Head to Head</p>
              <div className="flex items-center gap-2 sm:gap-3 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-400">{keyStats.h2h_record.home_wins}</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{keyStats.h2h_record.draws}</div>
                  <div className="text-xs text-muted-foreground">Draws</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-red-400">{keyStats.h2h_record.away_wins}</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <img 
            src={awayTeam.logo} 
            alt={awayTeam.name}
            className="h-16 w-16 sm:h-24 sm:w-24 object-contain"
          />
          <h1 className="text-lg sm:text-2xl font-bold break-words max-w-full">{awayTeam.name}</h1>
          {keyStats?.away_form && keyStats.away_form.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Recent Form</p>
              <div className="flex gap-1 justify-center">
                {keyStats.away_form.slice(0, 5).map((result, i) => (
                  <div key={i}>{getFormBadge(result)}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
