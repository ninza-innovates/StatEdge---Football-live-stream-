-- Insert Championship league
INSERT INTO public.leagues (id, name, slug, country, logo, type, season, "startDate", "endDate", is_active, order_index)
VALUES (
  40,
  'Championship',
  'championship',
  'England',
  'https://media.api-sports.io/football/leagues/40.png',
  'League',
  2024,
  '2024-08-09',
  '2025-05-03',
  true,
  2
)
ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  order_index = 2;

-- Shift other leagues' order_index down to make room
UPDATE public.leagues
SET order_index = order_index + 1
WHERE order_index >= 2 AND id != 40;