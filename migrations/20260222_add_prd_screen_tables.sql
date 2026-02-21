-- Adds backend tables required by PRD screens:
-- API Integrations, Data Requests, Talk With Team
-- This migration auto-detects key types for organizations.id and users.id
-- so it works with UUID or integer schemas.

DO $$
DECLARE
  org_id_type TEXT;
  user_id_type TEXT;
BEGIN
  SELECT pg_catalog.format_type(a.atttypid, a.atttypmod)
  INTO org_id_type
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relname = 'organizations'
    AND a.attname = 'id'
    AND a.attnum > 0
    AND NOT a.attisdropped
  LIMIT 1;

  SELECT pg_catalog.format_type(a.atttypid, a.atttypmod)
  INTO user_id_type
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relname = 'users'
    AND a.attname = 'id'
    AND a.attnum > 0
    AND NOT a.attisdropped
  LIMIT 1;

  IF org_id_type IS NULL THEN
    RAISE EXCEPTION 'Could not detect organizations.id type';
  END IF;

  IF user_id_type IS NULL THEN
    RAISE EXCEPTION 'Could not detect users.id type';
  END IF;

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS integrations (
      id SERIAL PRIMARY KEY,
      organization_id %s REFERENCES organizations(id),
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT ''disconnected'' CHECK (status IN (''connected'', ''disconnected'', ''syncing'', ''error'')),
      last_sync TIMESTAMP,
      config JSONB,
      created_at TIMESTAMP DEFAULT now()
    )',
    org_id_type
  );

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS data_requests (
      id SERIAL PRIMARY KEY,
      organization_id %s REFERENCES organizations(id),
      request_id TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      reason TEXT,
      priority TEXT NOT NULL DEFAULT ''medium'' CHECK (priority IN (''low'', ''medium'', ''high'')),
      deadline DATE,
      status TEXT NOT NULL DEFAULT ''pending'' CHECK (status IN (''pending'', ''submitted'', ''under_review'', ''closed'')),
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )',
    org_id_type
  );

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      organization_id %s REFERENCES organizations(id),
      sender_id %s REFERENCES users(id),
      category TEXT,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )',
    org_id_type,
    user_id_type
  );
END $$;

CREATE INDEX IF NOT EXISTS idx_integrations_org_id
  ON integrations (organization_id);

CREATE INDEX IF NOT EXISTS idx_data_requests_org_id
  ON data_requests (organization_id);

CREATE INDEX IF NOT EXISTS idx_data_requests_status
  ON data_requests (status);

CREATE INDEX IF NOT EXISTS idx_messages_org_id
  ON messages (organization_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON messages (created_at);
