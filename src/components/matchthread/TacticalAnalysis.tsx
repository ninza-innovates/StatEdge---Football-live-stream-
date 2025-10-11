import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TacticalAnalysisProps {
  analysis: {
    match_summary?: string;
    match_prediction?: string;
    key_player_matchups?: Array<{
      home_player: string;
      away_player: string;
      description: string;
    }>;
    pressing_styles?: {
      home: string;
      away: string;
    };
    transition_play?: {
      home: string;
      away: string;
    };
  };
}

export function TacticalAnalysis({ analysis }: TacticalAnalysisProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Tactical Analysis</h2>
      
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
          <TabsTrigger value="matchups">Key Matchups</TabsTrigger>
          <TabsTrigger value="pressing">Pressing</TabsTrigger>
          <TabsTrigger value="transition">Transition</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          {analysis.match_summary ? (
            <p className="text-foreground leading-relaxed">{analysis.match_summary}</p>
          ) : (
            <p className="text-muted-foreground">No tactical summary available</p>
          )}
        </TabsContent>

        <TabsContent value="prediction" className="mt-6">
          {analysis.match_prediction ? (
            <div className="space-y-4">
              <p className="text-foreground leading-relaxed">{analysis.match_prediction}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No prediction available</p>
          )}
        </TabsContent>

        <TabsContent value="matchups" className="mt-6">
          {analysis.key_player_matchups && analysis.key_player_matchups.length > 0 ? (
            <div className="space-y-4">
              {analysis.key_player_matchups.map((matchup, index) => (
                <div key={index} className="p-4 rounded-lg bg-card/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-primary">{matchup.home_player}</span>
                    <span className="text-muted-foreground text-sm">vs</span>
                    <span className="font-semibold text-destructive">{matchup.away_player}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{matchup.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No key matchups identified</p>
          )}
        </TabsContent>

        <TabsContent value="pressing" className="mt-6">
          {analysis.pressing_styles ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-semibold mb-2">Home Team</h3>
                <p className="text-sm text-muted-foreground">{analysis.pressing_styles.home}</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <h3 className="font-semibold mb-2">Away Team</h3>
                <p className="text-sm text-muted-foreground">{analysis.pressing_styles.away}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No pressing analysis available</p>
          )}
        </TabsContent>

        <TabsContent value="transition" className="mt-6">
          {analysis.transition_play ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-semibold mb-2">Home Team</h3>
                <p className="text-sm text-muted-foreground">{analysis.transition_play.home}</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <h3 className="font-semibold mb-2">Away Team</h3>
                <p className="text-sm text-muted-foreground">{analysis.transition_play.away}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No transition analysis available</p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
