-- Enable RLS on fixtures table if not already enabled
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to fixtures
CREATE POLICY "Allow public read access to fixtures"
ON public.fixtures
FOR SELECT
TO public
USING (true);

-- Enable RLS on teams table if not already enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to teams
CREATE POLICY "Allow public read access to teams"
ON public.teams
FOR SELECT
TO public
USING (true);

-- Enable RLS on leagues table if not already enabled
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to leagues
CREATE POLICY "Allow public read access to leagues"
ON public.leagues
FOR SELECT
TO public
USING (true);