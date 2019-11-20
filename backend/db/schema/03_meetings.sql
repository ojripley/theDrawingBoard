DROP TABLE IF EXISTS meetings CASCADE;
CREATE TABLE meetings (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER NOT NULL,
  name VARCHAR(255),
  description text,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(255),
  link_to_initial_doc VARCHAR(255),
  link_to_final_doc VARCHAR(255)
);