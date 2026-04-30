-- 007_add_offer_id_to_messages.sql

-- Link messages to offers so we can render them as offer cards
ALTER TABLE messages ADD COLUMN IF NOT EXISTS offer_id INTEGER REFERENCES offers(id) ON DELETE SET NULL;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_messages_offer ON messages(offer_id) WHERE offer_id IS NOT NULL;
