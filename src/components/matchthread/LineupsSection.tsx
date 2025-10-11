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
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Lineups & Team News</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Home Team */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{homeTeam}</h3>
            {lineupsData.home_formation && (
              <Badge variant="outline">{lineupsData.home_formation}</Badge>
            )}
          </div>

          {lineupsData.home_lineup && lineupsData.home_lineup.length > 0 ? (
            <div className="space-y-2 mb-6">
              {lineupsData.home_lineup.map((player, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span>{player}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">Lineup to be confirmed</p>
          )}

          {lineupsData.home_injuries && lineupsData.home_injuries.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <h4 className="text-sm font-semibold">Injuries & Suspensions</h4>
              </div>
              <div className="space-y-2">
                {lineupsData.home_injuries.map((injury, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{injury.player}</span>
                    <Badge variant="destructive" className="text-xs">{injury.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{awayTeam}</h3>
            {lineupsData.away_formation && (
              <Badge variant="outline">{lineupsData.away_formation}</Badge>
            )}
          </div>

          {lineupsData.away_lineup && lineupsData.away_lineup.length > 0 ? (
            <div className="space-y-2 mb-6">
              {lineupsData.away_lineup.map((player, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span>{player}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">Lineup to be confirmed</p>
          )}

          {lineupsData.away_injuries && lineupsData.away_injuries.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <h4 className="text-sm font-semibold">Injuries & Suspensions</h4>
              </div>
              <div className="space-y-2">
                {lineupsData.away_injuries.map((injury, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{injury.player}</span>
                    <Badge variant="destructive" className="text-xs">{injury.status}</Badge>
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
