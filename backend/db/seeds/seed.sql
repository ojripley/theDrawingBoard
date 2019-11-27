INSERT INTO users (username, password, email)
VALUES ('oj', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'oj@mail.com'),
('ta', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'ta@mail.com'),
('tc', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'tc@mail.com'),
('town bicycle', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'tb@mail.com'),
('Frank Lee', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'fl@mail.com'),
('Sophia Clark', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'sc@mail.com'),
('Azmut Jones', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'aj@mail.com'),
('John B. Goodenough', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'je@mail.com'),
('Will Burr', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'wb@mail.com'),
('George Gorge', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'gg@mail.com'),
('Hugo Dick', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'hd@mail.com'),
('Stacey Adams', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'sa@mail.com');



INSERT INTO friends (user_id, friend_id, relation)
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

-- ta and town bicyle
(2, 4, 'accepted'),
(4, 2, 'accepted');

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
