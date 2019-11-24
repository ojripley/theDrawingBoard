-- Drop and recreate matches table (Example)

DROP TABLE IF EXISTS friends CASCADE;
CREATE TABLE friends (
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  relation VARCHAR(255)
);
