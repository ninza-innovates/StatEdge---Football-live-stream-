import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { User, TrendingUp, Heart, Eye, CreditCard, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  ai_insights_used: number;
  ai_insights_limit: number;
  total_favorites: number;
  total_matches_viewed: number;
}

export default function Account() {
  const { user } = useAuth();
  const { subscriptionTier, isSubscribed } = useSubscription();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingBilling, setProcessingBilling] = useState(false);

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

  const handleManageBilling = async () => {
    setProcessingBilling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Please log in to manage your billing",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`https://fsoczxlarrlecnbwghdz.supabase.co/functions/v1/create-stripe-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      toast({
        title: "Error",
        description: "Failed to access billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingBilling(false);
    }
  };

  const handleUpgrade = async () => {
    setProcessingBilling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Please log in to upgrade",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`https://fsoczxlarrlecnbwghdz.supabase.co/functions/v1/create-stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1S5umg93V4MxVtg8OZ7fGzOi', // Monthly plan
          successUrl: `${window.location.origin}/account?success=true`,
          cancelUrl: `${window.location.origin}/account?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingBilling(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Account | StatEdge</title>
      </Helmet>

      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
        
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Account</h1>
            </div>

            {/* Profile Card */}
            <Card className="glass-card">
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subscription Plan</span>
                    <Badge variant={isSubscribed ? "default" : "secondary"}>
                      {subscriptionTier ? `${subscriptionTier} Plan` : 'Free Plan'}
                    </Badge>
                  </div>
                  
                  {isSubscribed ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleManageBilling}
                      disabled={processingBilling}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Subscription
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="hero" 
                        className="w-full"
                        onClick={handleUpgrade}
                        disabled={processingBilling}
                      >
                        Upgrade to Premium
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Unlock unlimited AI insights and premium features
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card className="glass-card">
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
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </>
  );
}
