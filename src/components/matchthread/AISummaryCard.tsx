import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface AISummaryCardProps {
  quickSummary: string;
  advancedSummary?: string;
  confidence: number;
  model: string;
}

export function AISummaryCard({ quickSummary, advancedSummary, confidence, model }: AISummaryCardProps) {
  const getConfidenceBadge = () => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High Confidence</Badge>;
    }
    if (confidence >= 0.6) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium Confidence</Badge>;
    }
    return <Badge variant="outline">Low Confidence</Badge>;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">AI Match Analysis</h2>
        </div>
        <div className="flex gap-2">
          {getConfidenceBadge()}
          <Badge variant="outline" className="text-xs">{model}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {quickSummary && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Quick Summary</h3>
            <p className="text-foreground leading-relaxed">{quickSummary}</p>
          </div>
        )}

        {advancedSummary && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Detailed Analysis</h3>
            <p className="text-foreground leading-relaxed">{advancedSummary}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
