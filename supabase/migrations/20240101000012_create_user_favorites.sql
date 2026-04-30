-- 012_create_user_favorites.sql

-- Saved freelancers per user
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, favorite_user_id),
  CONSTRAINT no_self_favorite CHECK (user_id <> favorite_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_created
  ON user_favorites(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_favorites_target
  ON user_favorites(favorite_user_id);
