-- Seed dummy users
-- Password hash is for "password123" using bcrypt

DO $$
DECLARE
  pwd TEXT := '$2b$10$YQ8WqZK7kG6RqF5E5HVIZuQH5sXuJ5p3yZ7zB2J9HJW8Q5KvC0JYe';
  u1 UUID; u2 UUID; u3 UUID; u4 UUID; u5 UUID; u6 UUID; u7 UUID; u8 UUID;
  s1 INT; s2 INT; s3 INT; s4 INT; s5 INT; s6 INT; s7 INT; s8 INT; s9 INT; s10 INT; s11 INT; s12 INT;
  l1 INT; l2 INT; l3 INT; l4 INT; l5 INT;
BEGIN

-- ── Insert Users ──────────────────────────────────────
INSERT INTO users (id, email, password_hash, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'sarah.dev@example.com', pwd, 'Sarah', 'Johnson', 'Professional House Cleaner', 'Deep cleaning, regular cleaning, and move-in/move-out services', 'Beirut, Lebanon', 'Professional cleaner with 5 years of experience. I take pride in making homes spotless and organized.', 25.00, 4.9, 32, true, 'House Cleaning', true)
RETURNING id INTO u1;

INSERT INTO users (id, email, password_hash, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'mike.butler@example.com', pwd, 'Mike', 'Chen', 'Expert Butler', 'Premium household management and butler services', 'Amman, Jordan', 'Trained butler with experience serving high-profile households. I ensure your home runs like clockwork.', 55.00, 4.8, 28, true, 'Butler Services', true)
RETURNING id INTO u2;

INSERT INTO users (id, email, password_hash, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'lina.photo@example.com', pwd, 'Lina', 'Khoury', 'Professional Photographer', 'Capturing moments that tell your story', 'Tripoli, Lebanon', 'Professional photographer specializing in portraits, events, and commercial photography. Over 8 years of experience.', 60.00, 4.7, 45, true, 'Photography', false)
RETURNING id INTO u3;

INSERT INTO users (id, email, password_hash, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'omar.tutor@example.com', pwd, 'Omar', 'Hassan', 'Math & Science Tutor', 'Making learning fun and accessible for all ages', 'Dubai, UAE', 'Certified tutor with 6 years of experience in mathematics and science. I help students build confidence and achieve top grades.', 30.00, 4.6, 19, false, 'Tutoring', true)
RETURNING id INTO u4;

INSERT INTO users (id, email, password_hash, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'nadia.events@example.com', pwd, 'Nadia', 'Farah', 'Event Planning Expert', 'Creating unforgettable events from concept to execution', 'Beirut, Lebanon', 'Event planner with expertise in weddings, corporate events, and private parties. Helped plan 100+ successful events.', 40.00, 4.5, 22, true, 'Event Planning', true)
RETURNING id INTO u5;

INSERT INTO users (id, email, password_hash, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'ali.driver@example.com', pwd, 'Ali', 'Mansour', 'Professional Chauffeur', 'Safe and reliable private driving services', 'Jeddah, Saudi Arabia', 'Licensed chauffeur with 10 years of experience. I provide safe, punctual, and comfortable transportation.', 35.00, 4.8, 37, true, 'Chauffeur & Drivers', false)
RETURNING id INTO u6;

INSERT INTO users (id, email, password_hash, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'raya.nanny@example.com', pwd, 'Raya', 'Abdel', 'Childcare Specialist', 'Loving and professional childcare and nanny services', 'Cairo, Egypt', 'Certified childcare provider with first aid training. I create a safe, fun, and nurturing environment for your children.', 20.00, 4.9, 53, true, 'Childcare & Nanny', true)
RETURNING id INTO u7;

INSERT INTO users (id, email, password_hash, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'karim.fitness@example.com', pwd, 'Karim', 'Nasser', 'Personal Fitness Trainer', 'Transform your body and mind with personalized training', 'Beirut, Lebanon', 'Certified personal trainer specializing in strength training, HIIT, and nutrition planning. Helping clients reach their goals for 7 years.', 45.00, 4.4, 15, false, 'Personal Training', true)
RETURNING id INTO u8;

-- ── Insert Skills ─────────────────────────────────────
INSERT INTO skills (name) VALUES ('Deep Cleaning')       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s1;
INSERT INTO skills (name) VALUES ('Laundry')             ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s2;
INSERT INTO skills (name) VALUES ('Organization')        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s3;
INSERT INTO skills (name) VALUES ('Table Setting')       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s4;
INSERT INTO skills (name) VALUES ('Household Management') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s5;
INSERT INTO skills (name) VALUES ('Portrait Photography') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s6;
INSERT INTO skills (name) VALUES ('Event Photography')   ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s7;
INSERT INTO skills (name) VALUES ('Math Tutoring')       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s8;
INSERT INTO skills (name) VALUES ('Decoration')          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s9;
INSERT INTO skills (name) VALUES ('Catering')            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s10;
INSERT INTO skills (name) VALUES ('Safe Driving')        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s11;
INSERT INTO skills (name) VALUES ('First Aid')           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s12;

-- ── Assign Skills to Users ────────────────────────────
-- Sarah (House Cleaning): Deep Cleaning, Laundry, Organization
INSERT INTO user_skills (user_id, skill_id) VALUES (u1, s1), (u1, s2), (u1, s3) ON CONFLICT DO NOTHING;
-- Mike (Butler Services): Table Setting, Household Management, Organization
INSERT INTO user_skills (user_id, skill_id) VALUES (u2, s4), (u2, s5), (u2, s3) ON CONFLICT DO NOTHING;
-- Lina (Photography): Portrait Photography, Event Photography
INSERT INTO user_skills (user_id, skill_id) VALUES (u3, s6), (u3, s7) ON CONFLICT DO NOTHING;
-- Omar (Tutoring): Math Tutoring
INSERT INTO user_skills (user_id, skill_id) VALUES (u4, s8) ON CONFLICT DO NOTHING;
-- Nadia (Event Planning): Decoration, Catering, Organization
INSERT INTO user_skills (user_id, skill_id) VALUES (u5, s9), (u5, s10), (u5, s3) ON CONFLICT DO NOTHING;
-- Ali (Chauffeur & Drivers): Safe Driving
INSERT INTO user_skills (user_id, skill_id) VALUES (u6, s11) ON CONFLICT DO NOTHING;
-- Raya (Childcare & Nanny): First Aid
INSERT INTO user_skills (user_id, skill_id) VALUES (u7, s12) ON CONFLICT DO NOTHING;
-- Karim (Personal Training): First Aid
INSERT INTO user_skills (user_id, skill_id) VALUES (u8, s12) ON CONFLICT DO NOTHING;

-- ── Insert Languages ──────────────────────────────────
INSERT INTO languages (name) VALUES ('English') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO l1;
INSERT INTO languages (name) VALUES ('Arabic')  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO l2;
INSERT INTO languages (name) VALUES ('French')  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO l3;
INSERT INTO languages (name) VALUES ('Spanish') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO l4;
INSERT INTO languages (name) VALUES ('German')  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO l5;

-- ── Assign Languages to Users ─────────────────────────
INSERT INTO user_languages (user_id, language_id) VALUES (u1, l1), (u1, l2) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u2, l1), (u2, l2), (u2, l3) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u3, l1), (u3, l2), (u3, l3) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u4, l1), (u4, l2) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u5, l1), (u5, l2), (u5, l3) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u6, l1), (u6, l2) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u7, l1), (u7, l2), (u7, l4) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u8, l1), (u8, l2) ON CONFLICT DO NOTHING;

END $$;
