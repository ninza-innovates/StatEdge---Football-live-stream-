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
        .from("leagues")
        .select("id, name, slug, logo, is_active, order_index")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setLeagues(data || []);
    } catch (error) {
      console.error("Error fetching leagues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-background/95 backdrop-blur-xl"
    >
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt="StatEdge.ai Logo"
            className="h-8 w-8 flex-shrink-0 rounded-lg"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              StatEdge.ai
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              AI Football Insights
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-auto">
        {/* Main Navigation */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/dashboard")}
                  isActive={isActive("/dashboard")}
                  tooltip="Dashboard"
                  className="h-9 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <Home className="h-4 w-4" />
                  <span className="text-sm">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-border/50" />

        {/* Leagues */}
        <SidebarGroup className="px-3 py-1">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
            Leagues
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Loading leagues...
                </div>
              ) : leagues.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No leagues available
                </div>
              ) : (
                leagues.map((league) => (
                  <SidebarMenuItem key={league.id}>
                    <SidebarMenuButton
                      onClick={() => navigate(`/league/${league.slug}`)}
                      isActive={isActive(`/league/${league.slug}`)}
                      tooltip={league.name}
                      className="h-9 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                    >
                      <img
                        src={league.logo}
                        alt={league.name}
                        className="h-4 w-4 object-contain"
                      />
                      <span className="truncate text-sm">{league.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-border/50" />

        {/* Additional Pages */}
        <SidebarGroup className="px-3 py-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/favourites")}
                  isActive={isActive("/favourites")}
                  tooltip="Favourites"
                  className="h-9 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Favourites</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/account")}
                  isActive={isActive("/account")}
                  tooltip="Account"
                  className="h-9 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/support")}
                  isActive={isActive("/support")}
                  tooltip="Support"
                  className="h-9 px-3 rounded-lg font-medium transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-sm">Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-3 bg-background/50">
        <div className="space-y-2">
          {/* Profile Preview */}
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-primary/5 transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold truncate">
                {user?.email || "User"}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {subscriptionTier ? `${subscriptionTier} Plan` : "Free Plan"}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start h-9 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="text-sm group-data-[collapsible=icon]:hidden">
              Sign Out
            </span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
