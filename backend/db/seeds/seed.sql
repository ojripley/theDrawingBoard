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
(3, 2, 'accepted');

INSERT INTO meetings (owner_id, name, description, status)
VALUES
(3, 'test1', 'this is meeting number one', 'past'),
(2, 'test2', null, 'past'),
(1, 'test3', 'this is meeting number three', 'past'),
(2, 'test4', null, 'past');


INSERT INTO users_meetings (user_id, meeting_id, attendance)
values (1, 1, 'accepted'),
(1, 2, 'rejected'),
(1, 3, 'invited'),
(2, 1, 'rejected'),
(2, 2, 'accepted'),
(2, 3, 'invited'),
(3, 1, 'accepted'),
(3, 2, 'accepted'),
(3, 3, 'rejected'),
(1, 4, 'accepted'),
(2, 4, 'accepted');
