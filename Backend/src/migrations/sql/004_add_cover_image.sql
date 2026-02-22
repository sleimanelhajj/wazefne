-- Add cover_image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image TEXT;
