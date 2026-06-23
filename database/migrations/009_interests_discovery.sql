-- Interests catalog, user interests, discovery profile fields
BEGIN;

CREATE TABLE IF NOT EXISTS interests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  emoji TEXT,
  slug TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS user_interests (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  interest_id INT NOT NULL REFERENCES interests (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, interest_id)
);

CREATE INDEX IF NOT EXISTS user_interests_interest_idx ON user_interests (interest_id);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS purpose TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS max_distance INT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

INSERT INTO interests (name, category, emoji, slug) VALUES
  ('Кино', 'culture', '🎬', 'movies'),
  ('Музыка', 'culture', '🎵', 'music'),
  ('Спорт', 'active', '⚽', 'sports'),
  ('Книги', 'culture', '📚', 'books'),
  ('Путешествия', 'lifestyle', '✈️', 'travel'),
  ('Игры', 'fun', '🎮', 'gaming'),
  ('Кулинария', 'lifestyle', '🍳', 'cooking'),
  ('Танцы', 'active', '💃', 'dance'),
  ('Животные', 'lifestyle', '🐾', 'pets'),
  ('Искусство', 'culture', '🎨', 'art'),
  ('Наука', 'culture', '🔬', 'science'),
  ('Кофе', 'lifestyle', '☕', 'coffee'),
  ('Природа', 'lifestyle', '🌿', 'nature'),
  ('Авто', 'lifestyle', '🚗', 'auto'),
  ('Йога', 'active', '🧘', 'yoga'),
  ('Волонтёрство', 'social', '🤝', 'volunteering')
ON CONFLICT (name) DO NOTHING;

COMMIT;
