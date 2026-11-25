# Уведомления о лайках, матчах и сообщениях — что нужно настроить

Код уже отправляет уведомление **в момент события** (лайк, матч, новое сообщение). Чтобы они
приходили на телефоны, нужны ключи — их создаёт владелец проекта, в репозиторий они не попадают.

## 1. iPhone и браузеры (Web Push) — ключи VAPID на Render

1. На своём компьютере выполните: `npx web-push generate-vapid-keys`
   (появятся Public Key и Private Key).
2. Render → сервис → **Environment** → добавьте:
   - `VAPID_PUBLIC_KEY` = Public Key
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = тот же Public Key (нужен **при сборке**)
   - `VAPID_PRIVATE_KEY` = Private Key
   - `VAPID_SUBJECT` = `mailto:ваш-адрес@почта`
3. Сохраните — Render пересоберёт сайт.
4. На iPhone: откройте сайт в Safari → «Поделиться» → **«На экран Домой»**, откройте Luvia с
   экрана «Домой» → Настройки → Уведомления → включить. (В обычной вкладке Safari iPhone не
   показывает уведомления — это ограничение Apple.)

## 2. Android-приложение — Firebase (бесплатно)

1. https://console.firebase.google.com → **Add project** (Google Analytics можно выключить).
2. В проекте: **Add app → Android**, package name: `com.timetomatch.app` → Register →
   скачайте **google-services.json**.
3. GitHub → репозиторий → Settings → Secrets and variables → Actions → **New repository secret**:
   имя `GOOGLE_SERVICES_JSON`, значение — всё содержимое файла google-services.json.
4. Firebase → ⚙ Project settings → **Service accounts** → **Generate new private key** →
   скачается JSON. Render → Environment → `FIREBASE_SERVICE_ACCOUNT` = всё содержимое этого
   JSON (одной строкой) → Save.
5. GitHub → Actions → **Android APK** → Run workflow. Установите новый APK. После входа
   приложение один раз спросит разрешение на уведомления — нажмите «Разрешить».
6. Проверка: Настройки → Уведомления → «Отправить тестовое уведомление».

Без шагов 3–4 приложение работает как раньше, просто без уведомлений.

## Что приходит
- «Вам поставили лайк ❤️» — без имени (кто лайкнул, видно с Premium).
- «Новый мэтч с Анной!» — обоим.
- «Анна — Новое сообщение» — без текста сообщения; не чаще одного раза в 3 минуты на переписку.
- Нажатие открывает нужный экран (лайки или чат).
