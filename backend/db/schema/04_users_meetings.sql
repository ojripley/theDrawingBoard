DROP TABLE IF EXISTS users_meetings CASCADE;
CREATE TABLE users_meetings (
  id SERIAL PRIMARY KEY NOT NULL,
  meeting_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  notes text,
  attendance VARCHAR(255)
);
