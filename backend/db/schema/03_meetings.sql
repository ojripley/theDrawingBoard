DROP TABLE IF EXISTS meetings
CASCADE;
CREATE TABLE meetings
(
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(255),
  active BOOLEAN NOT NULL DEFAULT FALSE,
  link_to_initial_doc VARCHAR(255),
  num_pages INTEGER
);
