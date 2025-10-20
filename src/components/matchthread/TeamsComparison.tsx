import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamsComparisonProps {
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
  keyStats?: {
    home_form?: string[];
    away_form?: string[];
    h2h_record?: { home_wins: number; away_wins: number; draws: number };
  };
}

export function TeamsComparison({ homeTeam, awayTeam, keyStats }: TeamsComparisonProps) {
  const getFormBadge = (result: string) => {
    if (result === "W")
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 min-w-6 justify-center">W</Badge>;
    if (result === "L")
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 min-w-6 justify-center">L</Badge>;
    return (
      <Badge variant="outline" className="min-w-6 justify-center">
        D
      </Badge>
    );
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-card to-card/50">
      {/* grid: 1 col on mobile, 3 cols on desktop; explicit row starts on md+ to stack VS above H2H */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center md:auto-rows-min">
        {/* H2H — mobile: TOP (order-1); desktop: CENTER COLUMN, BELOW VS (row-start-2) */}
        {keyStats?.h2h_record && (
          <div className="order-1 md:col-start-2 md:row-start-2 flex flex-col items-center text-center">
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

        {/* Home — mobile: after H2H (order-2); desktop: LEFT column */}
        <div className="order-2 md:col-start-1 md:row-start-1 flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <img src={homeTeam.logo} alt={homeTeam.name} className="h-16 w-16 sm:h-24 sm:w-24 object-contain" />
          <h1 className="text-lg sm:text-2xl font-bold break-words max-w-full">{homeTeam.name}</h1>
          {keyStats?.home_form?.length ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Recent Form</p>
              <div className="flex gap-1 justify-center">
                {keyStats.home_form.slice(0, 5).map((r, i) => (
                  <div key={i}>{getFormBadge(r)}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* VS — mobile: after Home (order-3); desktop: CENTER column, ABOVE H2H (row-start-1) */}
        <div className="order-3 md:col-start-2 md:row-start-1 flex justify-center">
          <div className="text-3xl sm:text-4xl font-bold text-muted-foreground" aria-hidden="true">
            VS
          </div>
        </div>

        {/* Away — mobile: last (order-4); desktop: RIGHT column */}
        <div className="order-4 md:col-start-3 md:row-start-1 flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <img src={awayTeam.logo} alt={awayTeam.name} className="h-16 w-16 sm:h-24 sm:w-24 object-contain" />
          <h1 className="text-lg sm:text-2xl font-bold break-words max-w-full">{awayTeam.name}</h1>
          {keyStats?.away_form?.length ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Recent Form</p>
              <div className="flex gap-1 justify-center">
                {keyStats.away_form.slice(0, 5).map((r, i) => (
                  <div key={i}>{getFormBadge(r)}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
