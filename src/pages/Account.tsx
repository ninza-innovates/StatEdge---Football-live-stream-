import { useEffect, useState } from "react";
import { User, TrendingUp, Heart, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface UserStats {
  ai_insights_used: number;
  ai_insights_limit: number;
  total_favorites: number;
  total_matches_viewed: number;
}

export default function Account() {
  const { user } = useAuth();
  const { subscriptionTier, isSubscribed } = useSubscription();
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
        .select('ai_insights_used, ai_insights_limit, total_favorites, total_matches_viewed')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Account</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details and subscription status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user?.created_at || '').toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Subscription Plan</span>
                <Badge variant={isSubscribed ? "default" : "secondary"}>
                  {subscriptionTier ? `${subscriptionTier} Plan` : 'Free Plan'}
                </Badge>
              </div>
              {!isSubscribed && (
                <p className="text-xs text-muted-foreground">
                  Upgrade to unlock unlimited AI insights and premium features
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Track your activity on StatEdge.ai</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading stats...</div>
            ) : stats ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Insights</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {stats.ai_insights_used} / {stats.ai_insights_limit === 0 ? '∞' : stats.ai_insights_limit}
                    </p>
                    <p className="text-xs text-muted-foreground">Insights used this month</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Favourites</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stats.total_favorites}</p>
                    <p className="text-xs text-muted-foreground">Matches saved</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Matches Viewed</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stats.total_matches_viewed}</p>
                    <p className="text-xs text-muted-foreground">Total matches analyzed</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No stats available</div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {!isSubscribed && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle>Unlock Premium Features</CardTitle>
              <CardDescription>
                Get unlimited AI insights, advanced analytics, and exclusive features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full md:w-auto">Upgrade Now</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
