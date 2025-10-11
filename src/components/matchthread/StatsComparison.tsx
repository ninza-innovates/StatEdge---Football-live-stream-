import { Card } from "@/components/ui/card";

interface StatsComparisonProps {
  keyStats: {
    home_goals_avg?: number;
    away_goals_avg?: number;
    home_xg_avg?: number;
    away_xg_avg?: number;
    home_possession?: number;
    away_possession?: number;
    home_shots_on_target?: number;
    away_shots_on_target?: number;
    home_corners_avg?: number;
    away_corners_avg?: number;
    home_goals_against_avg?: number;
    away_goals_against_avg?: number;
  };
}

export function StatsComparison({ keyStats }: StatsComparisonProps) {
  const stats = [
    {
      label: 'Avg Goals Scored',
      home: keyStats.home_goals_avg || 0,
      away: keyStats.away_goals_avg || 0,
    },
    {
      label: 'Avg Expected Goals (xG)',
      home: keyStats.home_xg_avg || 0,
      away: keyStats.away_xg_avg || 0,
    },
    {
      label: 'Avg Possession %',
      home: keyStats.home_possession || 0,
      away: keyStats.away_possession || 0,
    },
    {
      label: 'Avg Shots on Target',
      home: keyStats.home_shots_on_target || 0,
      away: keyStats.away_shots_on_target || 0,
    },
    {
      label: 'Avg Corners',
      home: keyStats.home_corners_avg || 0,
      away: keyStats.away_corners_avg || 0,
    },
    {
      label: 'Avg Goals Conceded',
      home: keyStats.home_goals_against_avg || 0,
      away: keyStats.away_goals_against_avg || 0,
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Key Match Statistics</h2>
      
      <div className="space-y-6">
        {stats.map((stat, index) => {
          const total = stat.home + stat.away;
          const homePercent = total > 0 ? (stat.home / total) * 100 : 50;
          const awayPercent = total > 0 ? (stat.away / total) * 100 : 50;

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-foreground">{stat.home.toFixed(1)}</span>
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="text-foreground">{stat.away.toFixed(1)}</span>
              </div>
              
              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                <div 
                  className="bg-primary transition-all duration-500"
                  style={{ width: `${homePercent}%` }}
                />
                <div 
                  className="bg-destructive transition-all duration-500"
                  style={{ width: `${awayPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
