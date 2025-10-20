import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Trophy, ShieldAlert, Goal } from "lucide-react";

interface BettingInsightsProps {
  bets: Array<{
    market: string;
    selection: string;
    reasoning: string;
    confidence: "high" | "medium" | "low";
  }>;
}

export function BettingInsights({ bets }: BettingInsightsProps) {
  const getConfidenceBadge = (confidence: string) => {
    if (confidence === "high") {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High</Badge>;
    }
    if (confidence === "medium") {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium</Badge>;
    }
    return <Badge variant="outline">Low</Badge>;
  };

  // Enforce fixed order and labels for the three requested insights
  const ORDER = [
    {
      key: "Match Result",
      label: "Who Will Win",
      icon: <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
    },
    {
      key: "Most Likely Carded",
      label: "Most Likely Carded",
      icon: <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
    },
    {
      key: "Most Likely Goal/Assist",
      label: "Most Likely to Score/Assist",
      icon: <Goal className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
    },
  ];

  const pickByMarket = (marketKey: string) => bets.find((b) => b.market === marketKey);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Betting Insights</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            AI-powered betting suggestions based on match analysis
          </p>
        </div>
        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      </div>

      <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-medium text-orange-400 mb-1">Responsible Gambling</p>
            <p className="text-muted-foreground">
              These insights are for informational purposes only. Please gamble responsibly and within your means.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {ORDER.map((spec, idx) => {
          const bet = pickByMarket(spec.key);
          if (!bet) return null;
          return (
            <div
              key={spec.key}
              className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-card to-card/50 border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  {spec.icon}
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">{spec.label}</h3>
                    <p className="text-xs sm:text-sm text-primary font-medium">{bet.selection}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">{getConfidenceBadge(bet.confidence)}</div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{bet.reasoning}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
