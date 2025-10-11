-- Insert Championship teams
INSERT INTO public.teams (id, name, country, logo, venue, founded) VALUES
(48, 'Sheffield United', 'England', 'https://media.api-sports.io/football/teams/48.png', 'Bramall Lane', 1889),
(49, 'Leeds United', 'England', 'https://media.api-sports.io/football/teams/49.png', 'Elland Road', 1919),
(35, 'Burnley', 'England', 'https://media.api-sports.io/football/teams/35.png', 'Turf Moor', 1882),
(46, 'Sunderland', 'England', 'https://media.api-sports.io/football/teams/46.png', 'Stadium of Light', 1879),
(1359, 'Middlesbrough', 'England', 'https://media.api-sports.io/football/teams/1359.png', 'Riverside Stadium', 1876),
(1334, 'West Bromwich Albion', 'England', 'https://media.api-sports.io/football/teams/1334.png', 'The Hawthorns', 1878),
(1346, 'Coventry', 'England', 'https://media.api-sports.io/football/teams/1346.png', 'Coventry Building Society Arena', 1883),
(1357, 'Luton', 'England', 'https://media.api-sports.io/football/teams/1357.png', 'Kenilworth Road', 1885),
(1355, 'Blackburn Rovers', 'England', 'https://media.api-sports.io/football/teams/1355.png', 'Ewood Park', 1875),
(1352, 'Norwich City', 'England', 'https://media.api-sports.io/football/teams/1352.png', 'Carrow Road', 1902)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  logo = EXCLUDED.logo,
  venue = EXCLUDED.venue;

-- Insert Championship fixtures
INSERT INTO public.fixtures (id, league_id, home_team_id, away_team_id, date, venue, status, goals) VALUES
(1200001, 40, 49, 48, '2025-10-15 19:45:00+00', 'Elland Road', 'NS', NULL),
(1200002, 40, 35, 46, '2025-10-15 19:45:00+00', 'Turf Moor', 'NS', NULL),
(1200003, 40, 1359, 1334, '2025-10-16 19:45:00+00', 'Riverside Stadium', 'NS', NULL),
(1200004, 40, 1346, 1357, '2025-10-16 19:45:00+00', 'Coventry Building Society Arena', 'NS', NULL),
(1200005, 40, 49, 35, '2025-10-08 14:00:00+00', 'Elland Road', 'FT', '{"home": 2, "away": 1}'::jsonb),
(1200006, 40, 48, 1359, '2025-10-08 14:00:00+00', 'Bramall Lane', 'FT', '{"home": 1, "away": 1}'::jsonb),
(1200007, 40, 46, 1346, '2025-10-08 14:00:00+00', 'Stadium of Light', 'FT', '{"home": 3, "away": 0}'::jsonb),
(1200008, 40, 1334, 1352, '2025-10-08 14:00:00+00', 'The Hawthorns', 'FT', '{"home": 2, "away": 2}'::jsonb),
(1200009, 40, 1357, 1355, '2025-10-01 19:45:00+00', 'Kenilworth Road', 'FT', '{"home": 1, "away": 3}'::jsonb),
(1200010, 40, 49, 1359, '2025-10-01 14:00:00+00', 'Elland Road', 'FT', '{"home": 3, "away": 1}'::jsonb),
(1200011, 40, 35, 48, '2025-10-01 14:00:00+00', 'Turf Moor', 'FT', '{"home": 0, "away": 2}'::jsonb),
(1200012, 40, 1346, 1334, '2025-09-28 14:00:00+00', 'Coventry Building Society Arena', 'FT', '{"home": 2, "away": 1}'::jsonb),
(1200013, 40, 46, 49, '2025-09-28 14:00:00+00', 'Stadium of Light', 'FT', '{"home": 0, "away": 4}'::jsonb),
(1200014, 40, 1352, 35, '2025-09-28 14:00:00+00', 'Carrow Road', 'FT', '{"home": 1, "away": 1}'::jsonb),
(1200015, 40, 48, 1357, '2025-09-21 14:00:00+00', 'Bramall Lane', 'FT', '{"home": 2, "away": 0}'::jsonb),
(1200016, 40, 1359, 49, '2025-09-21 14:00:00+00', 'Riverside Stadium', 'FT', '{"home": 1, "away": 2}'::jsonb),
(1200017, 40, 1355, 35, '2025-09-21 14:00:00+00', 'Ewood Park', 'FT', '{"home": 1, "away": 1}'::jsonb),
(1200018, 40, 1334, 46, '2025-09-21 14:00:00+00', 'The Hawthorns', 'FT', '{"home": 3, "away": 2}'::jsonb)
ON CONFLICT (id) DO NOTHING;