DROP TABLE IF EXISTS corona;
CREATE TABLE corona(
    id SERIAL PRIMARY KEY,
    country VARCHAR(255),
    totalconfirmed VARCHAR(255),
    totaldeaths VARCHAR(255),
    totalrecovered VARCHAR(255),
    date VARCHAR(255)

);