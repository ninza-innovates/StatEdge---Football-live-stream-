-- Insert mock AI summary data for Leeds United vs Sheffield United match
-- First, get the fixture ID for this match
DO $$
DECLARE
  v_fixture_id INTEGER;
BEGIN
  -- Find the fixture ID for Leeds vs Sheffield
  SELECT id INTO v_fixture_id
  FROM fixtures 
  WHERE home_team_id IN (SELECT id FROM teams WHERE name LIKE '%Leeds%')
    AND away_team_id IN (SELECT id FROM teams WHERE name LIKE '%Sheffield%')
  LIMIT 1;

  -- Delete any existing AI summary for this fixture
  DELETE FROM ai_summaries WHERE fixture_id = v_fixture_id;

  -- Insert comprehensive mock AI summary data
  INSERT INTO ai_summaries (
    fixture_id,
    quick_summary,
    advanced_summary,
    key_stats,
    tactical_analysis,
    advanced_insights,
    lineups_injuries,
    potential_bets,
    player_markets,
    confidence,
    model
  ) VALUES (
    v_fixture_id,
    'This Championship clash promises to be an intense battle between two promotion-chasing sides. Leeds United, playing at home, will look to dominate possession and control the tempo, while Sheffield United will aim to stay compact and hit on the counter. Both teams have strong defensive records but have struggled for goals in recent weeks.',
    'Leeds United have shown excellent form at Elland Road this season, winning 7 of their last 10 home games. Their possession-based approach under the manager has been effective, averaging 58% possession per game. However, they''ve been wasteful in front of goal, converting only 11% of their chances. Sheffield United arrive in good defensive shape, conceding just 4 goals in their last 6 away matches. Their counter-attacking threat, led by their pacey wingers, could prove crucial. The key battle will be in midfield, where Leeds'' technical players will try to break down Sheffield''s disciplined block. Set pieces could be decisive, with both teams scoring 30% of their goals from dead-ball situations this season.',
    jsonb_build_object(
      'home_form', ARRAY['W', 'D', 'W', 'W', 'L'],
      'away_form', ARRAY['W', 'W', 'D', 'L', 'W'],
      'h2h_record', jsonb_build_object(
        'home_wins', 8,
        'away_wins', 5,
        'draws', 3
      ),
      'home_goals_avg', 1.8,
      'away_goals_avg', 1.4,
      'home_xg_avg', 1.6,
      'away_xg_avg', 1.2,
      'home_possession', 58,
      'away_possession', 47,
      'home_shots_on_target', 5.2,
      'away_shots_on_target', 3.8,
      'home_corners_avg', 6.4,
      'away_corners_avg', 4.2,
      'home_goals_against_avg', 0.9,
      'away_goals_against_avg', 1.1
    ),
    jsonb_build_object(
      'match_summary', 'Leeds will dominate possession and territory, creating chances through patient build-up play and overloads in wide areas. Sheffield United will sit deep in a 5-3-2 formation, looking to absorb pressure and exploit space behind Leeds'' high defensive line on the counter.',
      'match_prediction', 'Leeds United 2-1 Sheffield United. Expect a tight, tactical battle with Leeds eventually breaking down Sheffield''s defense through persistent pressure and quality from set pieces.',
      'key_player_matchups', jsonb_build_array(
        jsonb_build_object(
          'home_player', 'Crysencio Summerville',
          'away_player', 'George Baldock',
          'description', 'Leeds'' tricky winger will test Sheffield''s wing-back with his pace and dribbling ability'
        ),
        jsonb_build_object(
          'home_player', 'Georginio Rutter',
          'away_player', 'John Egan',
          'description', 'The battle between Leeds'' creative forward and Sheffield''s experienced center-back will be crucial'
        ),
        jsonb_build_object(
          'home_player', 'Ilia Gruev',
          'away_player', 'Gustavo Hamer',
          'description', 'Two technical midfielders who will dictate the tempo and rhythm of the match'
        )
      ),
      'pressing_styles', jsonb_build_object(
        'home', 'Leeds employ an aggressive high press, looking to win the ball in the final third and create quick transitions. They press in a 4-2-3-1 shape with coordinated triggers.',
        'away', 'Sheffield United use a more conservative mid-block, allowing Leeds possession in non-dangerous areas before intensifying pressure when the ball enters the middle third.'
      ),
      'transition_play', jsonb_build_object(
        'home', 'Quick vertical passes through midfield, with full-backs providing width and overlapping runs. Focus on switching play to isolate wingers 1v1.',
        'away', 'Direct counter-attacks utilizing pace of wingers and striker. Long balls over the top to bypass Leeds'' press and exploit high defensive line.'
      )
    ),
    jsonb_build_object(
      'attack_zones', jsonb_build_object(
        'home', jsonb_build_object('left', 35, 'center', 40, 'right', 25),
        'away', jsonb_build_object('left', 30, 'center', 45, 'right', 25)
      ),
      'goal_timing_patterns', jsonb_build_object(
        'home', jsonb_build_object('first_half', 8, 'second_half', 12),
        'away', jsonb_build_object('first_half', 6, 'second_half', 9)
      ),
      'expected_goals_breakdown', jsonb_build_object(
        'home_1h', 0.8,
        'home_2h', 1.1,
        'away_1h', 0.5,
        'away_2h', 0.7
      ),
      'set_piece_dependency', jsonb_build_object(
        'home_corners', 6.4,
        'home_free_kicks', 3.2,
        'away_corners', 4.2,
        'away_free_kicks', 2.8
      ),
      'defensive_weaknesses', jsonb_build_object(
        'home', ARRAY['Vulnerable to pace in behind when pressing high', 'Struggles against direct, physical strikers', 'Set piece defending needs improvement'],
        'away', ARRAY['Can be overloaded in wide areas against possession teams', 'Susceptible to quick passing combinations in tight spaces', 'Wing-backs sometimes caught out of position']
      )
    ),
    jsonb_build_object(
      'home_lineup', ARRAY['Illan Meslier', 'Archie Gray', 'Joe Rodon', 'Ethan Ampadu', 'Junior Firpo', 'Glen Kamara', 'Ilia Gruev', 'Crysencio Summerville', 'Georginio Rutter', 'Wilfried Gnonto', 'Patrick Bamford'],
      'away_lineup', ARRAY['Wes Foderingham', 'George Baldock', 'John Egan', 'Anel Ahmedhodzic', 'Jack Robinson', 'Jayden Bogle', 'Gustavo Hamer', 'Vinicius Souza', 'Oliver Arblaster', 'James McAtee', 'Cameron Archer'],
      'home_formation', '4-2-3-1',
      'away_formation', '5-3-2',
      'home_injuries', jsonb_build_array(
        jsonb_build_object('player', 'Liam Cooper', 'status', 'Out - Knee Injury'),
        jsonb_build_object('player', 'Stuart Dallas', 'status', 'Doubtful - Muscle')
      ),
      'away_injuries', jsonb_build_array(
        jsonb_build_object('player', 'Chris Basham', 'status', 'Out - Ankle Injury'),
        jsonb_build_object('player', 'Ben Osborn', 'status', 'Out - Suspended')
      )
    ),
    jsonb_build_array(
      jsonb_build_object(
        'market', 'Match Result',
        'selection', 'Leeds United to Win',
        'reasoning', 'Leeds have won 7 of their last 10 home games and Sheffield United struggle away from home against possession-based teams. Leeds'' superior home form and tactical advantage make them favorites.',
        'confidence', 'medium'
      ),
      jsonb_build_object(
        'market', 'Both Teams to Score',
        'selection', 'Yes',
        'reasoning', 'Sheffield United have scored in 5 of their last 6 away games, and Leeds'' high defensive line is vulnerable to counters. Despite Leeds'' dominance, Sheffield should find at least one opportunity.',
        'confidence', 'high'
      ),
      jsonb_build_object(
        'market', 'Total Goals',
        'selection', 'Over 2.5 Goals',
        'reasoning', 'Leeds average 1.8 goals at home while Sheffield average 1.4 away. Combined xG suggests 2.8 total goals. Both teams'' recent form indicates an open game.',
        'confidence', 'medium'
      ),
      jsonb_build_object(
        'market', 'Corners',
        'selection', 'Leeds United Over 5.5 Corners',
        'reasoning', 'Leeds average 6.4 corners per home game and will have majority of possession. Sheffield''s deep defensive block typically concedes corners.',
        'confidence', 'high'
      )
    ),
    jsonb_build_object(
      'summerville_anytime', jsonb_build_object(
        'player', 'Crysencio Summerville',
        'market', 'Anytime Goalscorer',
        'value', 'Good value at current odds',
        'reasoning', 'In excellent form with 12 goals this season, favors playing against defensive teams'
      ),
      'rutter_assists', jsonb_build_object(
        'player', 'Georginio Rutter',
        'market', 'To Assist',
        'value', 'Strong value',
        'reasoning', 'Creates most chances in the team, averages 0.7 assists per game'
      )
    ),
    0.75,
    'google/gemini-2.5-flash'
  );
END $$;