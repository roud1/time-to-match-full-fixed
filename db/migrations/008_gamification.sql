-- Achievements, XP/levels, user unlocks
BEGIN;

CREATE TABLE IF NOT EXISTS achievements (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏅',
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INT NOT NULL DEFAULT 0,
  freeze_reward INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT achievements_xp_nonneg CHECK (xp_reward >= 0),
  CONSTRAINT achievements_freeze_nonneg CHECK (freeze_reward >= 0)
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  achievement_id BIGINT NOT NULL REFERENCES achievements (id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS user_achievements_user_idx ON user_achievements (user_id, unlocked_at DESC);

CREATE TABLE IF NOT EXISTS user_xp (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_xp_nonneg CHECK (xp >= 0),
  CONSTRAINT user_xp_level_min CHECK (level >= 1)
);

INSERT INTO achievements (key, title, description, icon, category, xp_reward, freeze_reward)
VALUES
  ('first_match', 'Первая искра', 'Получи первый мэтч', '🔥', 'matches', 50, 0),
  ('first_message', 'Разговор начат', 'Отправь первое сообщение', '💬', 'chat', 30, 0),
  ('chatterbox', 'Душа компании', 'Отправь 100 сообщений', '📣', 'chat', 150, 1),
  ('bond_builder', 'На одной волне', 'Продли мэтч через общение 3 раза', '🔗', 'bond', 100, 1),
  ('time_keeper', 'Хранитель времени', 'Используй заморозку впервые', '⛄', 'freeze', 50, 0),
  ('social_butterfly', 'Социальная бабочка', 'Имей 5 активных мэтчей одновременно', '🦋', 'social', 200, 2),
  ('night_owl', 'Ночной мотылёк', 'Отправь сообщение после 2:00 (UTC)', '🦉', 'chat', 40, 0),
  ('early_bird', 'Ранняя пташка', 'Отправь сообщение до 7:00 (UTC)', '🌅', 'chat', 40, 0),
  ('collector', 'Коллекционер', 'Разблокируй 5 достижений', '🏆', 'meta', 300, 2)
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  xp_reward = EXCLUDED.xp_reward,
  freeze_reward = EXCLUDED.freeze_reward;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_chk;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_chk
  CHECK (type IN ('profile_expiring', 'match_expiring', 'achievement_unlocked'));

COMMIT;
