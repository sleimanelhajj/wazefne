-- Users table
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id          VARCHAR(255) UNIQUE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  first_name        VARCHAR(100),
  last_name         VARCHAR(100),
  profile_image     TEXT,
  title             VARCHAR(255),
  offer_description TEXT,
  location          VARCHAR(255),
  about_me          TEXT,
  hourly_rate       NUMERIC(10,2),
  rating            NUMERIC(2,1) DEFAULT 0,
  review_count      INTEGER DEFAULT 0,
  verified          BOOLEAN DEFAULT FALSE,
  category          VARCHAR(100),
  available_today   BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users (clerk_id);

-- Skills table (many-to-many)
CREATE TABLE IF NOT EXISTS skills (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);

-- Languages table (many-to-many)
CREATE TABLE IF NOT EXISTS languages (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_languages (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, language_id)
);

-- Portfolio images
CREATE TABLE IF NOT EXISTS portfolio_images (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  caption    VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
