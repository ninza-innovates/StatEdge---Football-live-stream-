import { Card } from "@/components/ui/card";

interface AdvancedInsightsProps {
  insights: {
    attack_zones?: {
      home?: { left: number; center: number; right: number };
      away?: { left: number; center: number; right: number };
    };
    goal_timing_patterns?: {
      home?: { first_half: number; second_half: number };
      away?: { first_half: number; second_half: number };
    };
    expected_goals_breakdown?: {
      home_1h?: number;
      home_2h?: number;
      away_1h?: number;
      away_2h?: number;
    };
    set_piece_dependency?: {
      home_corners?: number;
      home_free_kicks?: number;
      away_corners?: number;
      away_free_kicks?: number;
    };
    defensive_weaknesses?: {
      home?: string[];
      away?: string[];
    };
  };
}

export function AdvancedInsights({ insights }: AdvancedInsightsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Advanced Insights</h2>

      <div className="grid gap-6">
        {/* Attack Zones */}
        {insights.attack_zones && (
          <div>
            <h3 className="font-semibold mb-4">Attack Zones Distribution</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {insights.attack_zones.home && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Home Team</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                      <div className="text-2xl font-bold text-primary">{insights.attack_zones.home.left}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Left</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/20 text-center">
                      <div className="text-2xl font-bold text-primary">{insights.attack_zones.home.center}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Center</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                      <div className="text-2xl font-bold text-primary">{insights.attack_zones.home.right}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Right</div>
                    </div>
                  </div>
                </div>
              )}

              {insights.attack_zones.away && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Away Team</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-destructive/10 text-center">
                      <div className="text-2xl font-bold text-destructive">{insights.attack_zones.away.left}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Left</div>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/20 text-center">
                      <div className="text-2xl font-bold text-destructive">{insights.attack_zones.away.center}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Center</div>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 text-center">
                      <div className="text-2xl font-bold text-destructive">{insights.attack_zones.away.right}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Right</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Goal Timing Patterns */}
        {insights.goal_timing_patterns && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Goal Timing Patterns</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {insights.goal_timing_patterns.home && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Home Team</p>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-primary/10 text-center">
                      <div className="text-xl font-bold text-primary">{insights.goal_timing_patterns.home.first_half}</div>
                      <div className="text-xs text-muted-foreground mt-1">1st Half</div>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-primary/10 text-center">
                      <div className="text-xl font-bold text-primary">{insights.goal_timing_patterns.home.second_half}</div>
                      <div className="text-xs text-muted-foreground mt-1">2nd Half</div>
                    </div>
                  </div>
                </div>
              )}

              {insights.goal_timing_patterns.away && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Away Team</p>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-destructive/10 text-center">
                      <div className="text-xl font-bold text-destructive">{insights.goal_timing_patterns.away.first_half}</div>
                      <div className="text-xs text-muted-foreground mt-1">1st Half</div>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-destructive/10 text-center">
                      <div className="text-xl font-bold text-destructive">{insights.goal_timing_patterns.away.second_half}</div>
                      <div className="text-xs text-muted-foreground mt-1">2nd Half</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Defensive Weaknesses */}
        {insights.defensive_weaknesses && (insights.defensive_weaknesses.home || insights.defensive_weaknesses.away) && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Defensive Weaknesses</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {insights.defensive_weaknesses.home && insights.defensive_weaknesses.home.length > 0 && (
                <div className="p-4 rounded-lg bg-card/50 border">
                  <p className="text-sm font-medium mb-2">Home Team</p>
                  <ul className="space-y-1">
                    {insights.defensive_weaknesses.home.map((weakness, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.defensive_weaknesses.away && insights.defensive_weaknesses.away.length > 0 && (
                <div className="p-4 rounded-lg bg-card/50 border">
                  <p className="text-sm font-medium mb-2">Away Team</p>
                  <ul className="space-y-1">
                    {insights.defensive_weaknesses.away.map((weakness, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
