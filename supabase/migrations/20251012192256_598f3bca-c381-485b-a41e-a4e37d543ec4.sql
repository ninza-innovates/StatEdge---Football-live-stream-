-- Create archive table for finished fixtures
CREATE TABLE IF NOT EXISTS public.fixtures_archive (
  id bigint PRIMARY KEY,
  league_id integer NOT NULL,
  home_team_id integer NOT NULL,
  away_team_id integer NOT NULL,
  date timestamp with time zone NOT NULL,
  venue text DEFAULT ''::text,
  status text NOT NULL DEFAULT ''::text,
  goals jsonb,
  stats_json jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create archive table for AI summaries
CREATE TABLE IF NOT EXISTS public.ai_summaries_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id bigint NOT NULL,
  quick_summary text,
  advanced_summary text,
  key_stats jsonb,
  tactical_analysis jsonb,
  lineups_injuries jsonb,
  potential_bets jsonb,
  advanced_insights jsonb,
  player_markets jsonb,
  confidence numeric,
  model text NOT NULL,
  fallback_used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  archived_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for efficient archival queries
CREATE INDEX IF NOT EXISTS idx_fixtures_status_date ON public.fixtures(status, date);
CREATE INDEX IF NOT EXISTS idx_fixtures_archive_date ON public.fixtures_archive(archived_at);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_fixture ON public.ai_summaries(fixture_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_archive_fixture ON public.ai_summaries_archive(fixture_id);

-- Enable RLS on archive tables
ALTER TABLE public.fixtures_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries_archive ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to archives
CREATE POLICY "Allow public read access to archived fixtures"
  ON public.fixtures_archive
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to archived AI summaries"
  ON public.ai_summaries_archive
  FOR SELECT
  USING (true);

COMMENT ON TABLE public.fixtures_archive IS 'Archive of finished fixtures older than 24 hours';
COMMENT ON TABLE public.ai_summaries_archive IS 'Archive of AI summaries for finished fixtures';