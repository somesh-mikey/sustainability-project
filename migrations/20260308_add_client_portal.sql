-- Migration: Add client portal support
-- Adds: notifications table, organization metadata, client user role support

-- 1. Add metadata columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  user_id INTEGER REFERENCES users(id),
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'message', 'request', 'upload')),
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- 3. Add description/reason field to data_requests if not exists
ALTER TABLE data_requests ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. Add report_type and description to reports if they don't exist
-- (reports table may have different schema, so use IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='report_type') THEN
    ALTER TABLE reports ADD COLUMN report_type TEXT DEFAULT 'general';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='description') THEN
    ALTER TABLE reports ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='status') THEN
    ALTER TABLE reports ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;
