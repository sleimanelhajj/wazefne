-- 008_update_offer_statuses.sql

-- Expand the status check constraint to support the full booking lifecycle
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check
  CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'in_progress', 'completed'));
