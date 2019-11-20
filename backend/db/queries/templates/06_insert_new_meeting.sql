INSERT INTO meetings (start_time, owner_id, name, status, link_to_inital_doc)
VALUES('formatedDateTime', 3, 'meetingTitle', 'greenMeansGo', 'bestPathIsOffPath')
RETURNING id;

INSERT INTO users_meetings (user_id, meeting_id, status)
VALUES users_meetings (3, 1, 'invited');
