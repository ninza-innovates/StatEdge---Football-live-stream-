import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LogOut, Trophy, User, Heart, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface League {
  id: number;
  name: string;
  slug: string;
  logo: string;
  is_active: boolean;
  order_index: number | null;
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscriptionTier } = useSubscription();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, name, slug, logo, is_active, order_index')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLeagues(data || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-background/95 backdrop-blur-xl">
      <SidebarHeader className="border-b border-border/50 p-6">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/dd09e007-2423-4091-b113-8404a07c3b63.png" 
            alt="StatEdge.ai" 
            className="h-10 w-auto transition-transform hover:scale-105"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/dashboard')}
                  isActive={isActive('/dashboard')}
                  tooltip="Dashboard"
                  className="h-11 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <Home className="h-4 w-4" />
                  <span className="text-sm">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-border/50" />

        {/* Leagues */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Leagues</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">Loading leagues...</div>
              ) : leagues.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">No leagues available</div>
              ) : (
                leagues.map((league) => (
                  <SidebarMenuItem key={league.id}>
                    <SidebarMenuButton
                      onClick={() => navigate(`/league/${league.slug}`)}
                      isActive={isActive(`/league/${league.slug}`)}
                      tooltip={league.name}
                      className="h-11 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                    >
                      <img 
                        src={league.logo} 
                        alt={league.name}
                        className="h-5 w-5 object-contain"
                      />
                      <span className="truncate text-sm">{league.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-border/50" />

        {/* Additional Pages */}
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/favourites')}
                  isActive={isActive('/favourites')}
                  tooltip="Favourites"
                  className="h-11 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Favourites</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/account')}
                  isActive={isActive('/account')}
                  tooltip="Account"
                  className="h-11 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/support')}
                  isActive={isActive('/support')}
                  tooltip="Support"
                  className="h-11 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-sm">Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 bg-background/50">
        <div className="space-y-3">
          {/* Profile Preview */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-primary/5 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {subscriptionTier ? `${subscriptionTier} Plan` : 'Free Plan'}
              </p>
            </div>
          </div>
          
          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start h-10 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
