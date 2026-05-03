-- ============================================================
-- Skinlytics Seed Data
-- Run AFTER schema.sql:
--   mysql -u root -p skincare_db < database/seed_data.sql
-- ============================================================

USE skincare_db;

-- ── Skin Types ───────────────────────────────────────────────
INSERT IGNORE INTO skin_types (name, description) VALUES
('Oily',        'Skin that produces excess sebum, often appearing shiny especially in the T-zone.'),
('Dry',         'Skin that lacks moisture, feels tight and may flake or crack.'),
('Combination', 'Oily in the T-zone (forehead, nose, chin) but dry or normal on cheeks.'),
('Normal',      'Well-balanced skin that is neither too oily nor too dry.'),
('Sensitive',   'Skin that reacts easily to products or environmental factors.');

-- ── Quiz Questions ───────────────────────────────────────────
INSERT IGNORE INTO quiz_questions (question_text, option_a, option_b, option_c, correct_answer, `order`) VALUES
('How does your skin feel a few hours after washing?',
 'Tight, dry, and sometimes flaky',
 'Comfortable and balanced',
 'Shiny and greasy, especially on the forehead and nose',
 'a', 1),

('How often does your skin look shiny during the day?',
 'Rarely or never',
 'Sometimes, only slightly',
 'Often, especially in the T-zone',
 'c', 2),

('How does your skin react to new skincare products?',
 'Often gets irritated, red, or breaks out',
 'Generally tolerates products well',
 'Products absorb quickly and skin stays oily',
 'a', 3),

('What does your skin look like by midday?',
 'Still feels dry and tight',
 'Still looks fresh and balanced',
 'Looks oily and pores appear enlarged',
 'b', 4),

('How would you describe your pores?',
 'Very small and barely visible',
 'Normal size, visible but not enlarged',
 'Large and often clogged',
 'c', 5);

-- ── Admin User ───────────────────────────────────────────────
-- Password hash below is Werkzeug pbkdf2:sha256 for 'admin123'
-- Recommended: use the Python seeder instead for a fresh hash:
--     cd backend && python seed_db.py
--
-- If you need a raw SQL insert, run this Python one-liner first to get
-- your own hash:
--     python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('admin123'))"
-- Then replace the hash value below.

INSERT IGNORE INTO users (name, email, password_hash, role, is_active, created_at)
VALUES (
  'Admin',
  'admin@gmail.com',
  'pbkdf2:sha256:260000$skinlytics$7e8b1c2d3a4f5e6d7c8b9a0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
  'admin',
  1,
  NOW()
);
-- NOTE: The hash above is a placeholder. Run `python seed_db.py` for a valid hash.
-- The Python seeder (seed_db.py) automatically creates admin@gmail.com / admin123
-- with a properly generated Werkzeug hash.

-- ── Blog Posts (Sample Content) ──────────────────────────────
-- Note: requires a user with id=1 to exist (run seed_db.py first).

-- INSERT INTO blogs (title, slug, content, author_id) VALUES
-- ('5 Tips for Clear Skin', '5-tips-for-clear-skin', 'Content here...', 1);
