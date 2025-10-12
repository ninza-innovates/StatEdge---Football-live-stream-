export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_summaries: {
        Row: {
          advanced_insights: Json | null
          advanced_summary: string | null
          confidence: number | null
          created_at: string | null
          fallback_used: boolean | null
          fixture_id: number
          key_stats: Json | null
          lineups_injuries: Json | null
          model: string
          player_markets: Json | null
          potential_bets: Json | null
          quick_summary: string | null
          tactical_analysis: Json | null
        }
        Insert: {
          advanced_insights?: Json | null
          advanced_summary?: string | null
          confidence?: number | null
          created_at?: string | null
          fallback_used?: boolean | null
          fixture_id: number
          key_stats?: Json | null
          lineups_injuries?: Json | null
          model: string
          player_markets?: Json | null
          potential_bets?: Json | null
          quick_summary?: string | null
          tactical_analysis?: Json | null
        }
        Update: {
          advanced_insights?: Json | null
          advanced_summary?: string | null
          confidence?: number | null
          created_at?: string | null
          fallback_used?: boolean | null
          fixture_id?: number
          key_stats?: Json | null
          lineups_injuries?: Json | null
          model?: string
          player_markets?: Json | null
          potential_bets?: Json | null
          quick_summary?: string | null
          tactical_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_summaries_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: true
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_summaries_archive: {
        Row: {
          advanced_insights: Json | null
          advanced_summary: string | null
          archived_at: string
          confidence: number | null
          created_at: string | null
          fallback_used: boolean | null
          fixture_id: number
          id: string
          key_stats: Json | null
          lineups_injuries: Json | null
          model: string
          player_markets: Json | null
          potential_bets: Json | null
          quick_summary: string | null
          tactical_analysis: Json | null
        }
        Insert: {
          advanced_insights?: Json | null
          advanced_summary?: string | null
          archived_at?: string
          confidence?: number | null
          created_at?: string | null
          fallback_used?: boolean | null
          fixture_id: number
          id?: string
          key_stats?: Json | null
          lineups_injuries?: Json | null
          model: string
          player_markets?: Json | null
          potential_bets?: Json | null
          quick_summary?: string | null
          tactical_analysis?: Json | null
        }
        Update: {
          advanced_insights?: Json | null
          advanced_summary?: string | null
          archived_at?: string
          confidence?: number | null
          created_at?: string | null
          fallback_used?: boolean | null
          fixture_id?: number
          id?: string
          key_stats?: Json | null
          lineups_injuries?: Json | null
          model?: string
          player_markets?: Json | null
          potential_bets?: Json | null
          quick_summary?: string | null
          tactical_analysis?: Json | null
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          away_team_id: number
          date: string
          goals: Json | null
          home_team_id: number
          id: number
          league_id: number
          stats_json: Json | null
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_team_id: number
          date?: string
          goals?: Json | null
          home_team_id: number
          id?: number
          league_id: number
          stats_json?: Json | null
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_team_id?: number
          date?: string
          goals?: Json | null
          home_team_id?: number
          id?: number
          league_id?: number
          stats_json?: Json | null
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      fixtures_archive: {
        Row: {
          archived_at: string
          away_team_id: number
          date: string
          goals: Json | null
          home_team_id: number
          id: number
          league_id: number
          stats_json: Json | null
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          archived_at?: string
          away_team_id: number
          date: string
          goals?: Json | null
          home_team_id: number
          id: number
          league_id: number
          stats_json?: Json | null
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          archived_at?: string
          away_team_id?: number
          date?: string
          goals?: Json | null
          home_team_id?: number
          id?: number
          league_id?: number
          stats_json?: Json | null
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      leagues: {
        Row: {
          country: string
          created_at: string
          endDate: string | null
          id: number
          is_active: boolean
          logo: string
          name: string
          order_index: number | null
          season: number
          slug: string
          startDate: string | null
          type: string
        }
        Insert: {
          country: string
          created_at?: string
          endDate?: string | null
          id?: number
          is_active?: boolean
          logo: string
          name?: string
          order_index?: number | null
          season: number
          slug?: string
          startDate?: string | null
          type: string
        }
        Update: {
          country?: string
          created_at?: string
          endDate?: string | null
          id?: number
          is_active?: boolean
          logo?: string
          name?: string
          order_index?: number | null
          season?: number
          slug?: string
          startDate?: string | null
          type?: string
        }
        Relationships: []
      }
      standings: {
        Row: {
          draw: number
          form: string | null
          goal_diff: number
          goals_against: number
          goals_for: number
          id: number
          league_id: number
          lose: number
          played: number
          points: number
          rank: number
          season: number
          team_id: number
          updated_at: string
          win: number
        }
        Insert: {
          draw?: number
          form?: string | null
          goal_diff?: number
          goals_against?: number
          goals_for?: number
          id?: number
          league_id: number
          lose?: number
          played?: number
          points?: number
          rank: number
          season: number
          team_id: number
          updated_at?: string
          win?: number
        }
        Update: {
          draw?: number
          form?: string | null
          goal_diff?: number
          goals_against?: number
          goals_for?: number
          id?: number
          league_id?: number
          lose?: number
          played?: number
          points?: number
          rank?: number
          season?: number
          team_id?: number
          updated_at?: string
          win?: number
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          country: string
          created_at: string
          founded: number | null
          id: number
          logo: string
          name: string
          venue: string
        }
        Insert: {
          country?: string
          created_at?: string
          founded?: number | null
          id?: number
          logo?: string
          name?: string
          venue?: string
        }
        Update: {
          country?: string
          created_at?: string
          founded?: number | null
          id?: number
          logo?: string
          name?: string
          venue?: string
        }
        Relationships: []
      }
      top_scorers: {
        Row: {
          appearances: number
          assists: number
          goals: number
          id: number
          league_id: number
          player_name: string
          player_photo: string | null
          season: number
          team_id: number
          updated_at: string
        }
        Insert: {
          appearances?: number
          assists?: number
          goals?: number
          id?: number
          league_id: number
          player_name: string
          player_photo?: string | null
          season: number
          team_id: number
          updated_at?: string
        }
        Update: {
          appearances?: number
          assists?: number
          goals?: number
          id?: number
          league_id?: number
          player_name?: string
          player_photo?: string | null
          season?: number
          team_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          fixture_id: number | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fixture_id?: number | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fixture_id?: number | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          ai_insights_limit: number | null
          ai_insights_used: number | null
          created_at: string | null
          id: string
          total_favorites: number | null
          total_matches_viewed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_insights_limit?: number | null
          ai_insights_used?: number | null
          created_at?: string | null
          id?: string
          total_favorites?: number | null
          total_matches_viewed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_insights_limit?: number | null
          ai_insights_used?: number | null
          created_at?: string | null
          id?: string
          total_favorites?: number | null
          total_matches_viewed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_ai_insights: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
