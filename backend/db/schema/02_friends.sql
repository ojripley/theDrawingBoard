-- Drop and recreate matches table (Example)

DROP TABLE IF EXISTS friends CASCADE;
CREATE TABLE friends (
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  user_status VARCHAR(255) NOT NULL
);
