# Фаза 1: что настроить вручную

Все переменные добавляются в Render: сервис `time-to-match-web` → **Environment**. После изменения нажми **Save, rebuild, and deploy**.

## 1. Почта — подтверждение email и сброс пароля
Письма отправляет сервер. Достаточно настроить ОДИН из способов (если заданы оба, используется SMTP).

### Вариант A: обычная почта по SMTP (проще всего, свой домен не нужен)
Gmail (до ~500 писем в сутки):
1. В аккаунте Google включи двухэтапную проверку, затем myaccount.google.com/apppasswords → создай пароль приложения (16 символов).
2. Render → Environment, добавь:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = твой адрес Gmail
   - `SMTP_PASS` = пароль приложения (без пробелов)
   - `SMTP_FROM` = тот же адрес Gmail (необязательно)

Brevo (бесплатно ~300 писем в сутки): `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, `SMTP_USER` = email аккаунта, `SMTP_PASS` = SMTP-ключ (SMTP & API → SMTP), `SMTP_FROM` = подтверждённый отправитель (Senders).

### Вариант B: Resend
`RESEND_API_KEY` и `RESEND_FROM_EMAIL`. Без подтверждённого домена Resend доставляет письма только владельцу аккаунта.

После добавления переменных нажми **Save, rebuild, and deploy**. Как только настроен любой способ, тестовое автоподтверждение (`AUTO_VERIFY_EMAIL`) перестаёт действовать само: новые пользователи получают письмо со ссылкой, а войти на другом устройстве до подтверждения нельзя. Письма могут сначала попадать в «Спам».

## 2. Фоновые задачи (внешний планировщик)
GitHub Actions по расписанию запускается редко и с задержкой, поэтому нужен внешний планировщик. Одно задание вместо трёх:
1. cron-job.org → аккаунт → **Create cronjob**.
2. URL: `https://time-to-match-web.onrender.com/api/v1/cron/tick`
3. Расписание: каждые 5 минут (раз в минуту — только если нужен более точный срок мэтчей).
4. **Advanced → Headers**: `Authorization` = `Bearer <значение CRON_SECRET из Render>`.
5. Тест: **Test run** должен вернуть `{"ok":true,...}`. Бонус: частые запросы не дают бесплатному серверу Render засыпать.
6. После этого workflow «Scheduled jobs» в GitHub можно не использовать.

## 3. Фото (Cloudflare R2, бесплатный тариф)
1. dash.cloudflare.com → **R2** → создать бакет `ttm-photos` → **Settings → Public access** (включить публичный URL `r2.dev` или подключить домен).
2. R2 → **Manage API tokens** → Create API token (Object Read & Write на этот бакет). Сохрани Access Key ID и Secret.
3. Render:
   - `S3_BUCKET` = `ttm-photos`
   - `S3_ACCESS_KEY` / `S3_SECRET_KEY` = ключи из шага 2
   - `S3_ENDPOINT` = `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
   - `S3_REGION` = `auto`
   - `S3_PUBLIC_URL` = публичный адрес бакета (`https://pub-….r2.dev`)

## 4. Тестовые флаги — убрать перед запуском для людей
- `SEED_DEMO_PROFILES` → `0` (демо-анкеты; удалить созданные: `DELETE FROM users WHERE email LIKE '%@demo.timetomatch.local';`)
- `AUTO_VERIFY_EMAIL` → удалить.

## Отложено
- `zod` 3 → 4 (мажорный переход, одна уязвимость высокого уровня: нехватка памяти на огромных массивах).
- `middleware.ts` → `proxy.ts` (Next 16 предупреждает, пока работает).
