-- Interests catalog seeds + discover field defaults
BEGIN;

ALTER TABLE users
  ALTER COLUMN age_min SET DEFAULT 18,
  ALTER COLUMN age_max SET DEFAULT 60;

UPDATE users SET age_min = 18 WHERE age_min IS NULL;
UPDATE users SET age_max = 60 WHERE age_max IS NULL;

INSERT INTO interests (name, category, emoji, slug) VALUES
  ('Фитнес', 'active', '💪', 'fitness'),
  ('Фотография', 'culture', '📷', 'photography'),
  ('Мода', 'lifestyle', '👗', 'fashion'),
  ('Вино', 'lifestyle', '🍷', 'wine'),
  ('Театр', 'culture', '🎭', 'theatre'),
  ('Сёрфинг', 'active', '🏄', 'surfing'),
  ('Медитация', 'active', '🧘‍♀️', 'meditation'),
  ('Стартапы', 'social', '🚀', 'startups'),
  ('Подкасты', 'culture', '🎙️', 'podcasts'),
  ('Бег', 'active', '🏃', 'running')
ON CONFLICT (name) DO NOTHING;

COMMIT;
