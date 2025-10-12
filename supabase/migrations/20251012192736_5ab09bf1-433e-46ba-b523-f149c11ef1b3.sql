-- Create standings table for league tables
CREATE TABLE IF NOT EXISTS public.standings (
  id bigserial PRIMARY KEY,
  league_id integer NOT NULL,
  season integer NOT NULL,
  team_id integer NOT NULL,
  rank integer NOT NULL,
  points integer NOT NULL DEFAULT 0,
  played integer NOT NULL DEFAULT 0,
  win integer NOT NULL DEFAULT 0,
  draw integer NOT NULL DEFAULT 0,
  lose integer NOT NULL DEFAULT 0,
  goals_for integer NOT NULL DEFAULT 0,
  goals_against integer NOT NULL DEFAULT 0,
  goal_diff integer NOT NULL DEFAULT 0,
  form text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(league_id, season, team_id)
);

-- Create top_scorers table
CREATE TABLE IF NOT EXISTS public.top_scorers (
  id bigserial PRIMARY KEY,
  league_id integer NOT NULL,
  season integer NOT NULL,
  player_name text NOT NULL,
  player_photo text,
  team_id integer NOT NULL,
  goals integer NOT NULL DEFAULT 0,
  assists integer NOT NULL DEFAULT 0,
  appearances integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(league_id, season, player_name, team_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_standings_league_season ON public.standings(league_id, season);
CREATE INDEX IF NOT EXISTS idx_standings_rank ON public.standings(rank);
CREATE INDEX IF NOT EXISTS idx_top_scorers_league_season ON public.top_scorers(league_id, season);
CREATE INDEX IF NOT EXISTS idx_top_scorers_goals ON public.top_scorers(goals DESC);

-- Enable RLS
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_scorers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to standings"
  ON public.standings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to top scorers"
  ON public.top_scorers
  FOR SELECT
  USING (true);

COMMENT ON TABLE public.standings IS 'League standings/table data from API-Football';
COMMENT ON TABLE public.top_scorers IS 'Top goal scorers data from API-Football';