CREATE TABLE heartbeats (
  id bigserial PRIMARY key,
  pid varchar(255) NOT NULL UNIQUE,
  email varchar(255) NOT NULL,
  agent varchar(255) NOT NULL,
  added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP DEFAULT NULL
);

CREATE TABLE events (
  id bigserial PRIMARY key,
  heartbeat varchar(20) NOT NULL,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  value varchar(20) DEFAULT NULL,
  min varchar(20) DEFAULT NULL,
  max varchar(20) DEFAULT NULL
);
