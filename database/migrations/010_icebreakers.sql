-- Chat icebreaker prompts
BEGIN;

CREATE TABLE IF NOT EXISTS icebreakers (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL CHECK (char_length(trim(text)) > 0),
  category TEXT NOT NULL CHECK (category IN ('question', 'flirt', 'funny', 'simple')),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS icebreakers_active_idx ON icebreakers (is_active) WHERE is_active = true;

INSERT INTO icebreakers (text, category) VALUES
  ('Если бы ты мог оказаться где угодно прямо сейчас — куда?', 'question'),
  ('Кофе или чай? От этого зависит наше будущее 😄', 'funny'),
  ('Какая песня сейчас играет у тебя в голове?', 'simple'),
  ('Твой идеальный выходной — это...?', 'question'),
  ('Что бы ты выбрал: уметь летать или быть невидимым?', 'funny'),
  ('Книга или фильм? Что последнее тронуло до мурашек?', 'question'),
  ('Ты сова или жаворонок? Только честно', 'simple'),
  ('Пицца с ананасами: да или нет? От этого многое зависит 😏', 'funny'),
  ('Что ты ценишь в людях больше всего?', 'question'),
  ('Твой любимый запах? У меня целая теория про это', 'flirt'),
  ('Если бы мы пошли гулять прямо сейчас — куда бы ты меня повёл/повела?', 'flirt'),
  ('Что обычно лежит у тебя на прикроватной тумбочке?', 'simple'),
  ('Какая мелочь сделала тебя счастливым на этой неделе?', 'question'),
  ('Ты больше по горам или по морю?', 'simple'),
  ('Твоё guilty pleasure (стыдное удовольствие)? Я не расскажу 😇', 'funny'),
  ('Что ты делаешь, когда никто не видит?', 'flirt'),
  ('Какой суперсилой ты бы хотел обладать?', 'funny'),
  ('Что для тебя важнее: ум или чувство юмора?', 'question'),
  ('Твой любимый способ провести вечер после тяжёлого дня?', 'simple'),
  ('Если бы ты мог поговорить с любым человеком из истории — кто бы это был?', 'question');

COMMIT;
