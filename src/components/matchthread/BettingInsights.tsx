import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface BettingInsightsProps {
  bets: Array<{
    market: string;
    selection: string;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
}

export function BettingInsights({ bets }: BettingInsightsProps) {
  const getConfidenceBadge = (confidence: string) => {
    if (confidence === 'high') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High</Badge>;
    }
    if (confidence === 'medium') {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium</Badge>;
    }
    return <Badge variant="outline">Low</Badge>;
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Betting Insights</h2>
          <p className="text-sm text-muted-foreground">AI-powered betting suggestions based on match analysis</p>
        </div>
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>

      <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-400 mb-1">Responsible Gambling</p>
            <p className="text-muted-foreground">
              These insights are for informational purposes only. Please gamble responsibly and within your means.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {bets.map((bet, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg bg-gradient-to-br from-card to-card/50 border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground mb-1">{bet.market}</h3>
                <p className="text-sm text-primary font-medium">{bet.selection}</p>
              </div>
              {getConfidenceBadge(bet.confidence)}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{bet.reasoning}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
