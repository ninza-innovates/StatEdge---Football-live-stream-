import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface LineupsSectionProps {
  lineupsData: {
    home_lineup?: string[];
    away_lineup?: string[];
    home_injuries?: Array<{ player: string; status: string }>;
    away_injuries?: Array<{ player: string; status: string }>;
    home_formation?: string;
    away_formation?: string;
  };
  homeTeam: string;
  awayTeam: string;
}

export function LineupsSection({ lineupsData, homeTeam, awayTeam }: LineupsSectionProps) {
  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Lineups & Team News</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Home Team */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-sm sm:text-base">{homeTeam}</h3>
            {lineupsData.home_formation && (
              <Badge variant="outline" className="text-xs">{lineupsData.home_formation}</Badge>
            )}
          </div>

          {lineupsData.home_lineup && lineupsData.home_lineup.length > 0 ? (
            <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
              {lineupsData.home_lineup.map((player, index) => (
                <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span className="truncate">{player}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Lineup to be confirmed</p>
          )}

          {lineupsData.home_injuries && lineupsData.home_injuries.length > 0 && (
            <div className="border-t pt-3 sm:pt-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                <h4 className="text-xs sm:text-sm font-semibold">Injuries & Suspensions</h4>
              </div>
              <div className="space-y-1 sm:space-y-2">
                {lineupsData.home_injuries.map((injury, index) => (
                  <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="truncate">{injury.player}</span>
                    <Badge variant="destructive" className="text-[10px] sm:text-xs">{injury.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-sm sm:text-base">{awayTeam}</h3>
            {lineupsData.away_formation && (
              <Badge variant="outline" className="text-xs">{lineupsData.away_formation}</Badge>
            )}
          </div>

          {lineupsData.away_lineup && lineupsData.away_lineup.length > 0 ? (
            <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
              {lineupsData.away_lineup.map((player, index) => (
                <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span className="truncate">{player}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Lineup to be confirmed</p>
          )}

          {lineupsData.away_injuries && lineupsData.away_injuries.length > 0 && (
            <div className="border-t pt-3 sm:pt-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                <h4 className="text-xs sm:text-sm font-semibold">Injuries & Suspensions</h4>
              </div>
              <div className="space-y-1 sm:space-y-2">
                {lineupsData.away_injuries.map((injury, index) => (
                  <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="truncate">{injury.player}</span>
                    <Badge variant="destructive" className="text-[10px] sm:text-xs">{injury.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
