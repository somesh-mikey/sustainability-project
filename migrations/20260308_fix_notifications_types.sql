-- Migration: Fix notifications type constraint to allow all needed types
-- and add period column to data_requests

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('info', 'warning', 'success', 'error', 'message', 'request', 'upload', 'data_request', 'report', 'system'));

-- Add period column to data_requests if not exists
ALTER TABLE data_requests ADD COLUMN IF NOT EXISTS period TEXT;
