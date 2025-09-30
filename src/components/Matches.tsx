import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Matches = () => {
  const matches = [
    {
      league: "Premier League",
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      date: "Apr 23",
      time: "14:00"
    },
    {
      league: "Premier League", 
      homeTeam: "Barcelona",
      awayTeam: "Real Madrid",
      date: "Apr 23",
      time: "16:30"
    },
    {
      league: "Premier League",
      homeTeam: "Nottingham Forest",
      awayTeam: "Manchester City",
      date: "Apr 24",
      time: "18:00"
    },
    {
      league: "Manchester City",
      homeTeam: "Manchester City",
      awayTeam: "Liverpool",
      date: "Apr 24", 
      time: "20:30"
    }
  ];

  return (
    <section id="matches" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
          Matches
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-muted-foreground">{match.league}</span>
                <span className="text-sm text-muted-foreground">{match.date} • {match.time}</span>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4">
                {match.homeTeam} vs {match.awayTeam}
              </h3>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AI Prediction</span>
                <Button variant="ghost" size="sm">
                  View <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Matches;