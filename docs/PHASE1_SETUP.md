# Фаза 1: что настроить вручную

Все переменные добавляются в Render: сервис `time-to-match-web` → **Environment**. После изменения нажми **Save, rebuild, and deploy**.

## 1. Почта (Resend) — подтверждение email и сброс пароля
1. resend.com → аккаунт → **API Keys** → **Create API Key**.
2. Render: `RESEND_API_KEY` = ключ, `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (тест: письма уходят только на адрес владельца аккаунта Resend; для всех нужен свой домен: Resend → Domains).
3. Когда `RESEND_API_KEY` задан, автоподтверждение (`AUTO_VERIFY_EMAIL`) перестаёт действовать само. Саму переменную потом удали.

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
