import { useEffect, useState } from "react";
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
          priceId: 'price_monthly', // You'll need to set the actual price ID
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

            {/* Billing & Subscription */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
                <CardDescription>Manage your subscription and billing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="space-y-1">
                    <p className="font-semibold">Current Plan</p>
                    <p className="text-2xl font-bold text-primary">
                      {subscriptionTier ? `${subscriptionTier} Plan` : 'Free Plan'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSubscribed 
                        ? 'Active subscription with full access' 
                        : 'Limited access to AI insights'}
                    </p>
                  </div>
                  <Badge variant={isSubscribed ? "default" : "secondary"} className="text-lg px-4 py-2">
                    {isSubscribed ? 'Active' : 'Free'}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  {isSubscribed ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={handleManageBilling}
                        disabled={processingBilling}
                      >
                        <span className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Manage Subscription
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Update payment method, view invoices, or cancel subscription
                      </p>
                    </>
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
                        Get unlimited AI insights and premium features
                      </p>
                    </>
                  )}
                </div>

                {isSubscribed && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Your Benefits</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Unlimited AI match insights
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Advanced analytics and predictions
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Priority support
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Early access to new features
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upgrade CTA for Free Users */}
            {!isSubscribed && (
              <Card className="glass-card border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle>Unlock Premium Features</CardTitle>
                  <CardDescription>
                    Get unlimited AI insights, advanced analytics, and exclusive features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="hero" className="w-full md:w-auto" onClick={handleUpgrade} disabled={processingBilling}>
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
