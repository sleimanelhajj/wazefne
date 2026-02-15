-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewed_user_id)  -- One review per user pair
);

-- Function to update user's average rating and review count
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the reviewed user's rating and review count
  UPDATE users
  SET 
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE reviewed_user_id = COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id)
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_user_id = COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id)
    )
  WHERE id = COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update ratings when reviews change
CREATE TRIGGER update_rating_on_review_change
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();
