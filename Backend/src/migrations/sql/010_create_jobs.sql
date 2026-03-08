-- 010_create_jobs.sql

-- Jobs posted by clients
CREATE TABLE IF NOT EXISTS jobs (
  id          SERIAL PRIMARY KEY,
  client_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget      NUMERIC(10,2),
  category    VARCHAR(100) NOT NULL,
  location    VARCHAR(255) NOT NULL,
  status      VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Bids/Proposals submitted by freelancers for jobs
CREATE TABLE IF NOT EXISTS job_bids (
  id            SERIAL PRIMARY KEY,
  job_id        INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposal      TEXT NOT NULL,
  proposed_rate NUMERIC(10,2) NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_bids_job ON job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_freelancer ON job_bids(freelancer_id);
