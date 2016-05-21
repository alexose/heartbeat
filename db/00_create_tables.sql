CREATE TABLE heartbeats (
  id bigserial PRIMARY key,
  pid varchar(20) NOT NULL,
  email varchar(255) NOT NULL,
  agent varchar(255) NOT NULL,
  added TIMESTAMP DEFAULT NULL,
  updated TIMESTAMP DEFAULT NULL
);

CREATE TABLE events (
  id bigserial PRIMARY key,
  heartbeat varchar(20) NOT NULL,
  time TIMESTAMP NOT NULL,
  value varchar(20) DEFAULT NULL,
  min varchar(20) DEFAULT NULL,
  max varchar(20) DEFAULT NULL
);
