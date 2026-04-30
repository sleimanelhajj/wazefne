-- 011_create_cv_analyses.sql

CREATE TABLE IF NOT EXISTS cv_analyses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  extracted_text TEXT NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  analysis_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cv_analyses_user_hash
  ON cv_analyses(user_id, file_hash);

CREATE INDEX IF NOT EXISTS idx_cv_analyses_user_created
  ON cv_analyses(user_id, created_at DESC);
