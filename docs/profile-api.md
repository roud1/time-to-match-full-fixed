# Profile API

Полный профиль пользователя Time to Match: фото, био, интересы, возраст, геолокация.

## Модель данных (TypeScript)

```typescript
type UserPhoto = {
  id: string
  url: string
  position: number
  isPrimary: boolean
  createdAt: string
}

type UserLocation = {
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  updatedAt: string | null
}

type UserProfile = {
  id: string
  displayName: string
  email: string
  bio: string
  birthDate: string | null   // YYYY-MM-DD
  age: number | null
  interests: Interest[]      // каталог interests
  interestIds: number[]
  interestSlugs: string[]
  photos: UserPhoto[]
  location: UserLocation
  gender: "male" | "female" | null
  purpose: string | null
  maxDistance: number
  photoVerified: boolean
}
```

## Схема БД

```sql
-- users (дополнительные колонки)
bio TEXT
birth_date DATE
location_city TEXT
location_country TEXT
location_updated_at TIMESTAMPTZ
latitude DOUBLE PRECISION      -- уже было
longitude DOUBLE PRECISION     -- уже было

-- user_photos
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
url TEXT NOT NULL
position INT NOT NULL DEFAULT 0
is_primary BOOLEAN NOT NULL DEFAULT false
created_at TIMESTAMPTZ NOT NULL DEFAULT now()

-- user_interests (junction, уже было)
user_id UUID, interest_id INT
```

Миграция: `database/migrations/025_user_profile.sql`

```bash
npm run db:migrate
```

## Эндпоинты

| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/profile` | Полный профиль |
| PATCH | `/api/profile` | Обновить bio, birthDate, interestIds |
| GET | `/api/profile/photos` | Список фото |
| POST | `/api/profile/photos` | Добавить фото по URL |
| DELETE | `/api/profile/photos/:id` | Удалить фото |
| PATCH | `/api/profile/location` | Обновить геолокацию |
| GET | `/api/me` | Расширен: bio, age, photos, location |

Все mutating-запросы требуют cookie-сессию (`requireAuth` + CSRF same-origin).

---

### GET `/api/profile`

**Response 200**

```json
{
  "profile": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "displayName": "Саша",
    "email": "sasha@example.com",
    "bio": "Люблю путешествия, кофе и живую музыку.",
    "birthDate": "1997-03-15",
    "age": 28,
    "interests": [
      { "id": 2, "name": "Музыка", "slug": "music", "emoji": "🎵", "category": "culture" },
      { "id": 5, "name": "Путешествия", "slug": "travel", "emoji": "✈️", "category": "lifestyle" }
    ],
    "interestIds": [2, 5],
    "interestSlugs": ["music", "travel"],
    "photos": [
      {
        "id": "f9e8d7c6-b5a4-3210-fedc-ba9876543210",
        "url": "https://cdn.example.com/users/sasha/photo1.jpg",
        "position": 0,
        "isPrimary": true,
        "createdAt": "2026-06-20T12:00:00.000Z"
      }
    ],
    "location": {
      "city": "Москва",
      "country": "Россия",
      "latitude": 55.75,
      "longitude": 37.61,
      "updatedAt": "2026-06-24T10:30:00.000Z"
    },
    "gender": "male",
    "purpose": "serious",
    "maxDistance": 50,
    "photoVerified": false
  }
}
```

---

### PATCH `/api/profile`

**Request**

```json
{
  "bio": "Обновлённое описание",
  "birthDate": "1997-03-15",
  "interestIds": [2, 5, 12]
}
```

**Response 200** — `{ "profile": { ... } }` (как GET).

---

### GET `/api/profile/photos`

**Response 200**

```json
{
  "photos": [
    { "id": "...", "url": "...", "position": 0, "isPrimary": true, "createdAt": "..." }
  ]
}
```

---

### POST `/api/profile/photos`

**Request**

```json
{
  "url": "https://cdn.example.com/new-photo.jpg",
  "isPrimary": false
}
```

Для загрузки файлов: сначала `POST /api/user/photos/upload-url`, затем PUT на presigned URL, затем POST сюда с `publicUrl`.

**Response 200**

```json
{
  "photo": {
    "id": "...",
    "url": "https://cdn.example.com/new-photo.jpg",
    "position": 1,
    "isPrimary": false,
    "createdAt": "..."
  }
}
```

---

### DELETE `/api/profile/photos/:id`

**Response 200**

```json
{ "success": true }
```

---

### PATCH `/api/profile/location`

**Request**

```json
{
  "latitude": 55.75,
  "longitude": 37.61,
  "city": "Москва",
  "country": "Россия"
}
```

**Response 200**

```json
{
  "location": {
    "city": "Москва",
    "country": "Россия",
    "latitude": 55.75,
    "longitude": 37.61,
    "updatedAt": "2026-06-24T10:30:00.000Z"
  },
  "profile": { "...": "..." }
}
```

---

## Пример полного payload

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "displayName": "Саша",
  "bio": "Люблю путешествия, кофе и живую музыку.",
  "age": 28,
  "interests": ["music", "travel"],
  "photos": [{ "id": "f9e8...", "url": "https://cdn.example.com/photo.jpg", "isPrimary": true }],
  "location": { "city": "Москва", "latitude": 55.75, "longitude": 37.61 }
}
```

## Серверный слой

```
server/profile/
├── profile.types.ts
├── profile.service.ts
├── profile.repository.ts
└── index.ts
```

## Demo mode

Без `DATABASE_URL` клиент (`client/lib/profile/api.ts`) сохраняет профиль в `localStorage` (`ttm-user-profile`).
