INSERT INTO users
  (username, password, email)
VALUES
  ('ojripley', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'oj@mail.com'),
  ('thilakshan', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'ta@mail.com'),
  ('tammiec', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'tc@mail.com'),
  ('herald_gerald', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'admin@mail.com'),
  ('townbicycle', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'tb@mail.com'),
  ('FrankLee', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'fl@mail.com'),
  ('lunarspectroscopy', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'aj@mail.com'),
  ('johnBEEgoodenough', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'je@mail.com'),
  ('saltyLegumes', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'wb@mail.com'),
  ('gorgeousgeorge88', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'gg@mail.com'),
  ('hugorichard', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'long@mail.com'),
  ('cityunicycle', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'ub@mail.com'),
  ('judging_U', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'zoom@mail.com'),
  ('SYNERGY', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'SYNERGY@mail.com'),
  ('kaladin', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'bridge4@mail.com'),
  ('kelsier', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'wheres_my_head@mail.com'),
  ('muncheez', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'basil_pesto@mail.com'),
  ('spiro', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'saviour@mail.com'),
  ('vasily', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'wheres_my_goats@mail.com'),
  ('mickey', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'mouse@mail.com'),
  ('thisShouldWork', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'jk_it_broke_stuff@mail.com');


INSERT INTO friends
  (user_id, friend_id, relation)
VALUES

  -- oj and ta
  (1, 2, 'accepted'),
  (2, 1, 'accepted'),

  -- oj and tc
  (1, 3, 'accepted'),
  (3, 1, 'accepted'),

  -- // ta and tc
  (2, 3, 'accepted'),
  (3, 2, 'accepted'),

  -- oj and town bicyle
  (1, 5, 'accepted'),
  (5, 1, 'accepted'),

  -- herald_gerald and oj
  (4, 1, 'requested'),
  (1, 4, 'pending'),

  -- herald_gerald and ta
  (4, 2, 'requested'),
  (2, 4, 'pending'),

  -- herald_gerald and tc
  (4, 3, 'requested'),
  (3, 4, 'pending');


-- INSERT INTO meetings (owner_id, name, description, status)
-- VALUES


-- INSERT INTO users_meetings (user_id, meeting_id, attendance)
-- values (1, 1, 'accepted'),
-- (1, 2, 'declined'),
-- (1, 3, 'invited'),
-- (2, 1, 'declined'),
-- (2, 2, 'accepted'),
-- (2, 3, 'invited'),
-- (3, 1, 'accepted'),
-- (3, 2, 'accepted'),
-- (3, 3, 'declined'),
-- (1, 4, 'accepted'),
-- (2, 4, 'accepted');

INSERT INTO dms
  (user_id, recipient_id, msg)
VALUES
  (1, 2, 'message 1'),
  (1, 2, 'message 2'),
  (2, 1, 'response 1'),
  (2, 1, 'response 2'),
  (1, 2, 'message 4'),
  (2, 1, 'response 4');
