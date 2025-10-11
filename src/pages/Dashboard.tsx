import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Eye, Zap } from "lucide-react";

interface UserStats {
  total_matches_viewed: number;
  total_favorites: number;
  ai_insights_used: number;
  ai_insights_limit: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { isSubscribed, subscriptionTier } = useSubscription();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('total_matches_viewed, total_favorites, ai_insights_used, ai_insights_limit')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            </div>
            {isSubscribed && (
              <Badge variant="default" className="bg-primary">
                {subscriptionTier === 'monthly' ? 'Pro Monthly' : 'Pro Weekly'}
              </Badge>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h2>
              <p className="text-muted-foreground">
                Here's your activity overview and stats
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Matches Viewed */}
              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Matches Viewed
                  </CardTitle>
                  <Eye className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stats?.total_matches_viewed || 0}
                  </div>
                </CardContent>
              </Card>

              {/* Favorites */}
              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Favorite Matches
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stats?.total_favorites || 0}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights Used */}
              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    AI Insights Used
                  </CardTitle>
                  <Zap className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? "..." : `${stats?.ai_insights_used || 0} / ${stats?.ai_insights_limit || 0}`}
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Status */}
              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Subscription
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isSubscribed ? "Active" : "Free"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Start</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Get started by exploring leagues in the sidebar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Browse Leagues</p>
                      <p className="text-xs text-muted-foreground">
                        Select a league from the sidebar to view today's matches
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                      <Zap className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Get AI Insights</p>
                      <p className="text-xs text-muted-foreground">
                        Click on any match to view detailed AI-powered analysis
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
