DROP TABLE IF EXISTS dupe CASCADE;

CREATE TABLE dupe (
  id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), 
  data jsonb
);