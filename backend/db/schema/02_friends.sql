-- Drop and recreate matches table (Example)

DROP TABLE IF EXISTS friends CASCADE;
CREATE TABLE friends (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  relation VARCHAR(255)
);
