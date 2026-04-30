-- 006_create_offers.sql

-- Offers sent within a conversation
CREATE TABLE IF NOT EXISTS offers (
  id                SERIAL PRIMARY KEY,
  conversation_id   INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  hourly_rate       NUMERIC(10,2) NOT NULL,
  status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by conversation
CREATE INDEX IF NOT EXISTS idx_offers_conversation ON offers(conversation_id, created_at);
