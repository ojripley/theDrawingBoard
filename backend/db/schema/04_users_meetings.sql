DROP TABLE IF EXISTS users_meetings CASCADE;
CREATE TABLE users_meetings (
  id SERIAL PRIMARY KEY NOT NULL,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  notes text,
  attendance VARCHAR(255)
);
