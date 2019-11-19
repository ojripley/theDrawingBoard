DROP TABLE IF EXISTS users-meetings CASCADE;
CREATE TABLE users-meetings (
  id id SERIAL PRIMARY KEY NOT NULL,
  meeting_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  link_to_notes VARCHAR(255),
  attendence VARCHAR(255)
);
