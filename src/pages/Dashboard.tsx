import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Heart, Eye, MapPin, Trophy } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header with Trigger */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
            <SidebarTrigger />
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 space-y-6">
            {/* Welcome Hero Banner */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/20 via-purple-600/20 to-primary/20 p-6 md:p-8 border border-primary/30">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
                  </h1>
                  <p className="text-muted-foreground">
                    Your AI insights for today are ready.
                  </p>
                </div>
                <Button variant="hero" size="lg" className="shrink-0">
                  View Today's Matches
                </Button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              {/* Date Filter */}
              <Select defaultValue="today">
                <SelectTrigger className="w-full md:w-[140px] bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              {/* League Filter */}
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[160px] bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  <SelectItem value="premier-league">Premier League</SelectItem>
                  <SelectItem value="la-liga">La Liga</SelectItem>
                  <SelectItem value="bundesliga">Bundesliga</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="flex-1 w-full md:max-w-md">
                <Input 
                  placeholder="Search teams..." 
                  className="bg-card border-border"
                />
              </div>

              {/* All / Favourites Tabs */}
              <div className="flex gap-2 ml-auto">
                <Button variant="hero" size="sm">
                  All
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Favourites
                </Button>
              </div>
            </div>

            {/* Featured Insights */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-primary rounded"></div>
                <h2 className="text-xl font-bold text-foreground">Featured Insights</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Match Card 1 */}
                <Card className="glass-card hover-lift p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                      Classic Rivalry
                    </Badge>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 ml-auto">
                      100°C
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground mb-2">Chelsea vs Liverpool</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Oct 4 at 16:30</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>Stamford Bridge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        <span>Premier League</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="h-5 w-5 rounded-full bg-blue-600"></div>
                        <span className="text-foreground font-medium">Chelsea</span>
                      </div>
                      <span className="text-muted-foreground">vs</span>
                      <div className="flex items-center gap-1">
                        <div className="h-5 w-5 rounded-full bg-red-600"></div>
                        <span className="text-foreground font-medium">Liverpool</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="hero" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Match
                  </Button>
                </Card>

                {/* Match Card 2 */}
                <Card className="glass-card hover-lift p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Big Match
                    </Badge>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 ml-auto">
                      100°C
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground mb-2">Real Madrid vs Villarreal</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Oct 4 at 19:00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>Estadio Santiago Bernabéu</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        <span>La Liga</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="h-5 w-5 rounded-full bg-white"></div>
                        <span className="text-foreground font-medium">Real Madrid</span>
                      </div>
                      <span className="text-muted-foreground">vs</span>
                      <div className="flex items-center gap-1">
                        <div className="h-5 w-5 rounded-full bg-yellow-500"></div>
                        <span className="text-foreground font-medium">Villarreal</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="hero" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Match
                  </Button>
                </Card>

                {/* Match Card 3 */}
                <Card className="glass-card hover-lift p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Big Match
                    </Badge>
                    <Badge className="bg-orange-400/20 text-orange-300 border-orange-400/30 ml-auto">
                      90°C
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground mb-2">Arsenal vs West Ham</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Oct 4 at 14:00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>Emirates Stadium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        <span>Premier League</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="h-5 w-5 rounded-full bg-red-500"></div>
                        <span className="text-foreground font-medium">Arsenal</span>
                      </div>
                      <span className="text-muted-foreground">vs</span>
                      <div className="flex items-center gap-1">
                        <div className="h-5 w-5 rounded-full bg-purple-900"></div>
                        <span className="text-foreground font-medium">West Ham</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="hero" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Match
                  </Button>
                </Card>
              </div>
            </div>

            {/* Today's Fixtures */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-primary rounded"></div>
                <h2 className="text-xl font-bold text-foreground">Today's Fixtures</h2>
              </div>

              <Card className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No matches found for the selected filters</p>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
