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
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/dd09e007-2423-4091-b113-8404a07c3b63.png" 
            alt="StatEdge.ai" 
            className="h-12 w-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/dashboard')}
                  isActive={isActive('/dashboard')}
                  tooltip="Dashboard"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Leagues */}
        <SidebarGroup>
          <SidebarGroupLabel>Leagues</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="px-2 py-1 text-xs text-muted-foreground">Loading leagues...</div>
              ) : leagues.length === 0 ? (
                <div className="px-2 py-1 text-xs text-muted-foreground">No leagues available</div>
              ) : (
                leagues.map((league) => (
                  <SidebarMenuItem key={league.id}>
                    <SidebarMenuButton
                      onClick={() => navigate(`/league/${league.slug}`)}
                      isActive={isActive(`/league/${league.slug}`)}
                      tooltip={league.name}
                    >
                      <img 
                        src={league.logo} 
                        alt={league.name}
                        className="h-4 w-4 object-contain"
                      />
                      <span className="truncate">{league.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Additional Pages */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/favourites')}
                  isActive={isActive('/favourites')}
                  tooltip="Favourites"
                >
                  <Heart className="h-4 w-4" />
                  <span>Favourites</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/account')}
                  isActive={isActive('/account')}
                  tooltip="Account"
                >
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/support')}
                  isActive={isActive('/support')}
                  tooltip="Support"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="space-y-3">
          {/* Profile Preview */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {subscriptionTier ? `${subscriptionTier} Plan` : 'Free Plan'}
              </p>
            </div>
          </div>
          
          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
