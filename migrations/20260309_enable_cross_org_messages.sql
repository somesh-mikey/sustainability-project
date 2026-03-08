ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS sender_organization_id INTEGER REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS recipient_organization_id INTEGER REFERENCES organizations(id);

UPDATE messages
SET sender_organization_id = COALESCE(sender_organization_id, organization_id),
    recipient_organization_id = COALESCE(recipient_organization_id, organization_id)
WHERE sender_organization_id IS NULL
   OR recipient_organization_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_sender_org
  ON messages (sender_organization_id);

CREATE INDEX IF NOT EXISTS idx_messages_recipient_org
  ON messages (recipient_organization_id);
