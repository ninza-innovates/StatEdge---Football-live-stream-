import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, Zap, Shield, CheckCircle2, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';

interface MatchPreview {
  id: string;
  home_team_name: string;
  away_team_name: string;
  league_name: string;
  date: string;
}

const Start = () => {
  const navigate = useNavigate();
  const [featuredMatches, setFeaturedMatches] = useState<MatchPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Facebook Pixel - PageView
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    fetchFeaturedMatches();
    
    // Exit-intent detection for mobile (scroll up quickly)
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY - 50 && currentScrollY < 200) {
        setShowExitModal(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const fetchFeaturedMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          id,
          date,
          home_team:teams!fixtures_home_team_id_fkey(name),
          away_team:teams!fixtures_away_team_id_fkey(name),
          league:leagues!fixtures_league_id_fkey(name)
        `)
        .gte('date', new Date().toISOString())
        .eq('status', 'NS')
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;

      const matches: MatchPreview[] = (data || []).map((match: any) => ({
        id: match.id,
        home_team_name: match.home_team?.name || 'TBD',
        away_team_name: match.away_team?.name || 'TBD',
        league_name: match.league?.name || 'Unknown',
        date: match.date,
      }));

      setFeaturedMatches(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    // Facebook Pixel - InitiateCheckout
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }
    navigate('/auth');
  };

  const handleMatchClick = (matchId: string) => {
    // Facebook Pixel - ViewContent
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_type: 'match',
        content_ids: [matchId],
      });
    }
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <>
      <Helmet>
        <title>Start | StatEdge</title>
        <meta name="description" content="Get AI-powered football match analysis and predictions for 10+ top leagues. Data-driven insights to help you make smarter predictions. Just $4.99/week." />
        <meta property="og:title" content="Start | StatEdge" />
        <meta property="og:description" content="Get AI-powered football match analysis and predictions for 10+ top leagues. Data-driven insights to help you make smarter predictions. Just $4.99/week." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Start | StatEdge" />
        <meta name="twitter:description" content="Get AI-powered football match analysis and predictions for 10+ top leagues. Data-driven insights to help you make smarter predictions. Just $4.99/week." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/dd09e007-2423-4091-b113-8404a07c3b63.png" 
                alt="StatEdge" 
                className="h-24 w-auto"
              />
            </div>
            <Button onClick={handleSignUpClick} size="sm" className="btn-gradient-primary">
              Sign Up
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative px-4 pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              🔥 1000+ Active Users
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              AI-Powered Match
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Insights & Analysis
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get data-driven match predictions for 10+ top leagues. Make smarter decisions with AI analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button onClick={handleSignUpClick} size="lg" className="btn-gradient-primary h-14 px-8 text-lg">
                Get Started Now
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Only $4.99/week • Cancel anytime • 1000+ matches analyzed weekly
            </p>
          </div>
        </section>

        {/* Social Proof */}
        <section className="px-4 py-8 border-y border-border bg-card/30">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">10+</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Top Leagues</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">1000+</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Matches/Week</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">85%</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Leagues We Cover */}
        <section className="px-4 py-12 bg-card/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Leagues We Cover
              </h2>
              <p className="text-muted-foreground">
                Comprehensive AI analysis across all major football leagues
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Premier League */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/d3dec733-3b64-497d-b80a-707d0096ce57.png" 
                  alt="Premier League"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">Premier League</span>
              </div>

              {/* EFL Championship */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/efl-championship.png" 
                  alt="EFL Championship"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">EFL Championship</span>
              </div>

              {/* EFL League One */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/efl-league-one.png" 
                  alt="EFL League One"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">EFL League One</span>
              </div>

              {/* Bundesliga */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/6c102d89-cba1-40c5-9221-d370e01d753f.png" 
                  alt="Bundesliga"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">Bundesliga</span>
              </div>

              {/* Ligue 1 */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/a818f2a0-c95a-45a3-af9d-1b2e08abf969.png" 
                  alt="Ligue 1"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">Ligue 1</span>
              </div>

              {/* Champions League */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/3686a251-497b-4adb-93cb-f72c8dbbb985.png" 
                  alt="Champions League"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">Champions League</span>
              </div>

              {/* Europa League */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/6f221313-1a4f-48b1-b8a4-f78e58aae314.png" 
                  alt="Europa League"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">Europa League</span>
              </div>

              {/* Serie A */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/f7ed4810-3f2d-469d-8988-45a2b3194876.png" 
                  alt="Serie A"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">Serie A</span>
              </div>

              {/* La Liga */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift">
                <img 
                  src="/lovable-uploads/b7b6b688-263b-4c80-bfb8-891ce947ed21.png" 
                  alt="La Liga"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xs text-center text-muted-foreground">La Liga</span>
              </div>

              {/* Primeira Liga (if you have it) - using a placeholder */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg glass-card hover-lift opacity-60">
                <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="text-xs text-center text-muted-foreground">+ More</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Matches Preview */}
        <section className="px-4 py-12">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Today's Featured Matches
              </h2>
              <p className="text-muted-foreground">
                See what our AI says about these games
              </p>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 glass-card animate-pulse">
                    <div className="h-20 bg-muted/20 rounded" />
                  </Card>
                ))
              ) : featuredMatches.length === 0 ? (
                <Card className="p-8 text-center glass-card">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No matches available right now</p>
                </Card>
              ) : (
                featuredMatches.map((match) => (
                  <Card 
                    key={match.id} 
                    className="p-4 glass-card hover-lift cursor-pointer"
                    onClick={() => handleMatchClick(match.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {match.league_name}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {formatMatchDate(match.date)} • {formatMatchTime(match.date)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base md:text-lg font-semibold text-foreground flex-1">
                        {match.home_team_name}
                      </span>
                      <span className="text-sm text-muted-foreground px-3">vs</span>
                      <span className="text-base md:text-lg font-semibold text-foreground flex-1 text-right">
                        {match.away_team_name}
                      </span>
                    </div>

                    {/* Blurred preview of insights */}
                    <div className="relative mt-4 p-4 rounded-lg bg-muted/10 overflow-hidden">
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Button onClick={handleSignUpClick} className="btn-gradient-primary">
                          <Shield className="h-4 w-4 mr-2" />
                          Unlock AI Analysis
                        </Button>
                      </div>
                      <div className="blur-sm select-none">
                        <div className="text-sm space-y-2">
                          <p className="text-foreground"><strong>Win Probability:</strong> Home 45% | Draw 28% | Away 27%</p>
                          <p className="text-foreground"><strong>Key Insight:</strong> Home team has won 4 of last 5...</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Why StatEdge */}
        <section className="px-4 py-12 bg-card/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
              Why Choose StatEdge?
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 glass-card text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms analyze thousands of data points per match
                </p>
              </Card>

              <Card className="p-6 glass-card text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">85% Accuracy</h3>
                <p className="text-sm text-muted-foreground">
                  Our predictions consistently outperform traditional analysis
                </p>
              </Card>

              <Card className="p-6 glass-card text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">1000+ Users</h3>
                <p className="text-sm text-muted-foreground">
                  Join thousands making smarter predictions daily
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-12">
          <div className="container mx-auto max-w-2xl">
            <Card className="p-8 md:p-12 glass-card text-center border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to Start Winning?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join 1000+ users getting AI-powered match insights
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span>Access to all 10+ leagues</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span>Real-time match analysis</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              <Button onClick={handleSignUpClick} size="lg" className="btn-gradient-primary h-14 px-8 md:px-12 text-base md:text-lg w-full md:w-auto whitespace-nowrap">
                Get Started - $4.99/week
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                No commitment • Cancel anytime • Secure payment
              </p>
            </Card>
          </div>
        </section>

        {/* Sticky Bottom CTA Bar (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <Button onClick={handleSignUpClick} className="btn-gradient-primary w-full h-12 text-sm whitespace-nowrap">
            Get Started - $4.99/week
          </Button>
        </div>

        {/* Exit Intent Modal */}
        <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Wait! Don't Miss Out 🎯</DialogTitle>
              <DialogDescription className="text-base pt-4">
                Join 1000+ users who are already making smarter predictions with AI-powered insights.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">85% Accuracy Rate</p>
                  <p className="text-sm text-muted-foreground">Our AI outperforms traditional analysis</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Only $4.99/Week</p>
                  <p className="text-sm text-muted-foreground">Cancel anytime, no questions asked</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">1000+ Matches Weekly</p>
                  <p className="text-sm text-muted-foreground">Coverage of all major leagues</p>
                </div>
              </div>
            </div>

            <Button onClick={handleSignUpClick} className="btn-gradient-primary h-12 w-full text-base">
              Get Started Now
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

// Extend Window interface for Facebook Pixel
declare global {
  interface Window {
    fbq?: (event: string, eventName: string, params?: any) => void;
  }
}

export default Start;
