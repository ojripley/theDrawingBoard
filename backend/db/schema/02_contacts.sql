-- Drop and recreate matches table (Example)

DROP TABLE IF EXISTS contacts CASCADE;
CREATE TABLE contacts (
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  user1_status VARCHAR(255) NOT NULL,
  user2_status VARCHAR(255) NOT NULL
);
