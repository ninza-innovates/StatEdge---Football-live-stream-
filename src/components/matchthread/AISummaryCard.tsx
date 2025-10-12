import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
interface AISummaryCardProps {
  quickSummary: string;
  advancedSummary?: string;
  confidence: number;
  model: string;
}
export function AISummaryCard({
  quickSummary,
  advancedSummary,
  confidence,
  model
}: AISummaryCardProps) {
  const getConfidenceBadge = () => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High Confidence</Badge>;
    }
    if (confidence >= 0.6) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium Confidence</Badge>;
    }
    return <Badge variant="outline">Low Confidence</Badge>;
  };
  return <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold">AI Match Analysis</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {getConfidenceBadge()}
          
        </div>
      </div>

      <div className="space-y-4">
        {quickSummary && <div>
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">Quick Summary</h3>
            <p className="text-sm sm:text-base text-foreground leading-relaxed">{quickSummary}</p>
          </div>}

        {advancedSummary && <div className="pt-4 border-t">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">Detailed Analysis</h3>
            <p className="text-sm sm:text-base text-foreground leading-relaxed">{advancedSummary}</p>
          </div>}
      </div>
    </Card>;
}