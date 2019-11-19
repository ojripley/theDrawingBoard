INSERT INTO users (username, password, email)
VALUES ('oj', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'oj@mail.com'),
('ta', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'ta@mail.com'),
('tc', '$2b$10$3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'tc@mail.com'),
('town bicycle', '3E3dOlmiEADLQ09ViClGCulfRNm0nUI2cX5kRdiqMHlbRmZAkWyvW', 'tb@mail.com');

INSERT INTO friends (user_id, friend_id, user_status)
VALUES
(1, 2, 'requested'),
(1, 3, 'accepted'),
(2, 1, 'pending'),
(2, 3, 'accepted'),
(3, 1, 'accepted'),
(3, 3, 'accepted');

INSERT INTO meetings (owner_id, name, status)
VALUES
(3, 'test1', 'past'),
(2, 'test2', 'active'),
(1, 'test3', 'scheduled');

INSERT INTO users-meetings (user_id, meeting_id, attendance)
(1, 1, 'accepted'),
(1, 2, 'rejected'),
(1, 3, 'invited'),
(2, 1, 'rejected'),
(2, 2, 'accepted'),
(2, 3, 'invited'),
(3, 1, 'accepted'),
(3, 2, 'accepted'),
(3, 3, 'rejected');
