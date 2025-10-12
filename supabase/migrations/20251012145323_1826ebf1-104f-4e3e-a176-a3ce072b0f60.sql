-- Update order_index for leagues after Championship to make room for EFL League One
UPDATE leagues SET order_index = order_index + 1 WHERE order_index >= 3;

-- Insert EFL League One
INSERT INTO leagues (
  id,
  name,
  slug,
  country,
  logo,
  type,
  season,
  "startDate",
  "endDate",
  order_index,
  is_active
) VALUES (
  41,
  'EFL League One',
  'efl-league-one',
  'England',
  'https://media.api-sports.io/football/leagues/41.png',
  'League',
  2024,
  '2024-08-01',
  '2025-05-31',
  3,
  true
);