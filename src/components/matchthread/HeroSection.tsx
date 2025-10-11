import { Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  league: {
    name: string;
    logo: string;
  };
  date: string;
  venue: string;
  status: string;
}

export function HeroSection({ league, date, venue, status }: HeroSectionProps) {
  const matchDate = new Date(date);
  const now = new Date();
  const timeUntilMatch = matchDate.getTime() - now.getTime();
  const hoursUntil = Math.floor(timeUntilMatch / (1000 * 60 * 60));
  const daysUntil = Math.floor(hoursUntil / 24);

  const getStatusBadge = () => {
    if (status === 'FT') {
      return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">Full Time</Badge>;
    }
    if (status === 'LIVE' || status === '1H' || status === '2H') {
      return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">Live</Badge>;
    }
    if (timeUntilMatch > 0 && hoursUntil < 24) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Starting Soon</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const getCountdown = () => {
    if (status === 'FT') return 'Match Finished';
    if (status === 'LIVE' || status === '1H' || status === '2H') return 'Match in Progress';
    if (timeUntilMatch < 0) return 'Match Started';
    
    if (daysUntil > 0) {
      return `${daysUntil} day${daysUntil > 1 ? 's' : ''} until kick-off`;
    }
    if (hoursUntil > 0) {
      return `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''} until kick-off`;
    }
    const minutesUntil = Math.floor(timeUntilMatch / (1000 * 60));
    return `${minutesUntil} minute${minutesUntil > 1 ? 's' : ''} until kick-off`;
  };

  return (
    <div className="relative bg-gradient-to-br from-primary/20 via-background to-background border-b">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={league.logo} 
            alt={league.name}
            className="h-12 w-12 object-contain"
          />
          <div>
            <h2 className="text-lg font-semibold text-foreground">{league.name}</h2>
            <p className="text-sm text-muted-foreground">Match Thread</p>
          </div>
          <div className="ml-auto">
            {getStatusBadge()}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {matchDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {matchDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{venue || 'Venue TBD'}</span>
          </div>
        </div>

        {timeUntilMatch > 0 && hoursUntil < 72 && (
          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-center text-sm font-medium text-primary">
              {getCountdown()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
