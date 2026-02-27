-- Seed dummy users
-- Password hash is for "password123" using bcrypt

DO $$
DECLARE
  pwd TEXT := '$2b$10$.HuNLTfdUoxj09g.pHJTzOKNqYcsr5c4RQPFVVYpAPgipNFrLEpZa';
  u1 UUID; u2 UUID; u3 UUID; u4 UUID; u5 UUID; u6 UUID; u7 UUID; u8 UUID; u9 UUID; u10 UUID; u11 UUID; u12 UUID;
  s1 INT; s2 INT; s3 INT; s4 INT; s5 INT; s6 INT; s7 INT; s8 INT; s9 INT; s10 INT; s11 INT; s12 INT; s13 INT; s14 INT; s15 INT; s16 INT;
  l1 INT; l2 INT; l3 INT; l4 INT; l5 INT;
BEGIN

-- ── Insert Users ──────────────────────────────────────
INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'sarah.dev@example.com', pwd, 'https://randomuser.me/api/portraits/women/68.jpg', 'Sarah', 'Johnson', 'Professional House Cleaner', 'Deep cleaning, regular cleaning, and move-in/move-out services', 'Achrafieh, Beirut', 'Professional cleaner with 5 years of experience. I take pride in making homes spotless and organized.', 25.00, 0, 0, true, 'House Cleaning', true)
RETURNING id INTO u1;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'mike.butler@example.com', pwd, 'https://randomuser.me/api/portraits/men/32.jpg', 'Mike', 'Chen', 'Expert Butler', 'Premium household management and butler services', 'Jounieh', 'Trained butler with experience serving high-profile households. I ensure your home runs like clockwork.', 55.00, 0, 0, true, 'Butler Services', true)
RETURNING id INTO u2;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'lina.photo@example.com', pwd, 'https://randomuser.me/api/portraits/women/44.jpg', 'Lina', 'Khoury', 'Professional Photographer', 'Capturing moments that tell your story', 'Tripoli', 'Professional photographer specializing in portraits, events, and commercial photography. Over 8 years of experience.', 60.00, 0, 0, true, 'Photography', false)
RETURNING id INTO u3;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'omar.tutor@example.com', pwd, 'https://randomuser.me/api/portraits/men/46.jpg', 'Omar', 'Hassan', 'Math & Science Tutor', 'Making learning fun and accessible for all ages', 'Zahle', 'Certified tutor with 6 years of experience in mathematics and science. I help students build confidence and achieve top grades.', 30.00, 0, 0, false, 'Tutoring', true)
RETURNING id INTO u4;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'nadia.events@example.com', pwd, 'https://randomuser.me/api/portraits/women/90.jpg', 'Nadia', 'Farah', 'Event Planning Expert', 'Creating unforgettable events from concept to execution', 'Hamra, Beirut', 'Event planner with expertise in weddings, corporate events, and private parties. Helped plan 100+ successful events.', 40.00, 0, 0, true, 'Event Planning', true)
RETURNING id INTO u5;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'ali.driver@example.com', pwd, 'https://randomuser.me/api/portraits/men/62.jpg', 'Ali', 'Mansour', 'Professional Chauffeur', 'Safe and reliable private driving services', 'Baabda', 'Licensed chauffeur with 10 years of experience. I provide safe, punctual, and comfortable transportation.', 35.00, 0, 0, true, 'Chauffeur & Drivers', false)
RETURNING id INTO u6;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'raya.nanny@example.com', pwd, 'https://randomuser.me/api/portraits/women/33.jpg', 'Raya', 'Abdel', 'Childcare Specialist', 'Loving and professional childcare and nanny services', 'Saida (Sidon)', 'Certified childcare provider with first aid training. I create a safe, fun, and nurturing environment for your children.', 20.00, 0, 0, true, 'Childcare & Nanny', true)
RETURNING id INTO u7;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'karim.fitness@example.com', pwd, 'https://randomuser.me/api/portraits/men/84.jpg', 'Karim', 'Nasser', 'Personal Fitness Trainer', 'Transform your body and mind with personalized training', 'Verdun, Beirut', 'Certified personal trainer specializing in strength training, HIIT, and nutrition planning. Helping clients reach their goals for 7 years.', 45.00, 0, 0, false, 'Personal Training', true)
RETURNING id INTO u8;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'john@gmail.com', pwd, 'https://randomuser.me/api/portraits/men/22.jpg', 'John', 'Doe', 'Expert Handyman', 'Reliable home repairs and maintenance', 'Ashrafieh, Beirut', 'Jack of all trades with 15 years experience fixing everything around the house. Fast and reliable service.', 30.00, 0, 0, true, 'Handyman', true)
RETURNING id INTO u9;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'emma.chef@example.com', pwd, 'https://randomuser.me/api/portraits/women/24.jpg', 'Emma', 'Smith', 'Personal Chef', 'Custom meals tailored to your dietary needs', 'Downtown Beirut', 'Culinary arts graduate specializing in organic and healthy meal preparations for individuals and families.', 50.00, 0, 0, true, 'Cooking & Baking', false)
RETURNING id INTO u10;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'david.garden@example.com', pwd, 'https://randomuser.me/api/portraits/men/11.jpg', 'David', 'Brown', 'Landscape Designer', 'Beautiful gardens and outdoor spaces', 'Byblos', 'Passionate gardener that brings life to your backyard. Specialized in sustainable native plants.', 35.00, 0, 0, false, 'Gardening', true)
RETURNING id INTO u11;

INSERT INTO users (id, email, password_hash, profile_image, first_name, last_name, title, offer_description, location, about_me, hourly_rate, rating, review_count, verified, category, available_today)
VALUES
  (gen_random_uuid(), 'sofia.pets@example.com', pwd, 'https://randomuser.me/api/portraits/women/12.jpg', 'Sofia', 'Garcia', 'Professional Pet Sitter', 'Loving care for your furry friends', 'Sin El Fil', 'Lifelong animal lover providing dog walking, pet sitting, and basic grooming services.', 15.00, 0, 0, true, 'Pet Care', true)
RETURNING id INTO u12;

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
INSERT INTO skills (name) VALUES ('Plumbing')            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s13;
INSERT INTO skills (name) VALUES ('Gourmet Cooking')     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s14;
INSERT INTO skills (name) VALUES ('Landscaping')         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s15;
INSERT INTO skills (name) VALUES ('Animal Care')         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO s16;

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
-- John (Handyman): Plumbing
INSERT INTO user_skills (user_id, skill_id) VALUES (u9, s13) ON CONFLICT DO NOTHING;
-- Emma (Cooking): Gourmet Cooking
INSERT INTO user_skills (user_id, skill_id) VALUES (u10, s14) ON CONFLICT DO NOTHING;
-- David (Gardening): Landscaping
INSERT INTO user_skills (user_id, skill_id) VALUES (u11, s15) ON CONFLICT DO NOTHING;
-- Sofia (Pet Sitter): Animal Care
INSERT INTO user_skills (user_id, skill_id) VALUES (u12, s16) ON CONFLICT DO NOTHING;

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
INSERT INTO user_languages (user_id, language_id) VALUES (u9, l1) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u10, l1), (u10, l3) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u11, l1) ON CONFLICT DO NOTHING;
INSERT INTO user_languages (user_id, language_id) VALUES (u12, l1), (u12, l4) ON CONFLICT DO NOTHING;

END $$;
