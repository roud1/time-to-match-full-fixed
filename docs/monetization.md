# Monetization — Premium, Like Limits, Profile Boost

Time to Match monetization builds on the existing Stripe billing stack (`config/stripe`, `/api/billing/*`) and adds a dedicated `server/monetization/` module with daily like limits and profile boost.

## Database (migration 026)

```bash
npm run db:migrate
```

Migration `026_monetization.sql` adds:

| Storage | Fields |
|---------|--------|
| `users` | `boost_expires_at TIMESTAMPTZ` |
| `user_subscriptions` | `premium_until TIMESTAMPTZ` (grace / manual grants) |
| `user_daily_likes` | `(user_id, like_date)` → `likes_used` |

Subscription tier/status and Stripe IDs remain in `user_subscriptions` (migration 020).

## User model / subscription field

`GET /api/me` returns a `subscription` object on the user:

```json
{
  "user": {
    "subscription": {
      "tier": "free",
      "status": "none",
      "isPremium": false,
      "currentPeriodEnd": null,
      "premiumUntil": null,
      "limits": {
        "unlimited": false,
        "dailyLimit": 20,
        "usedToday": 3,
        "remaining": 17,
        "resetsAt": "2026-06-25T00:00:00.000Z"
      },
      "boost": {
        "active": false,
        "expiresAt": null,
        "multiplier": 1
      }
    }
  }
}
```

## Server module

```
server/monetization/
├── constants.ts           # FREE_LIKES_PER_DAY=20, BOOST_DURATION_MINUTES=30
├── types.ts
├── repository.ts          # DB: daily likes, boost_expires_at
├── subscription.service.ts  # isPremium, getSubscription
├── limits.service.ts        # checkLikeLimit, consumeLike
├── boost.service.ts         # activateBoost, isBoostActive
├── access.ts                # canUserLike, canBoost, requirePremium
└── index.ts
```

### Premium check

```typescript
import { isPremium, getSubscription } from "@/server/monetization"

const sub = await getSubscription(userId)
if (sub.isPremium) {
  // unlimited likes, free boost activation, etc.
}
```

Premium is active when Stripe subscription is `active`/`trialing` with plan `premium`/`vip`, or `premium_until` / `current_period_end` is in the future.

### Like limits

Free users: **20 likes per UTC day**. Premium: unlimited.

Access check in `recordLike` (`server/matching/matching.service.ts`):

```typescript
const access = await canUserLike(userId)
if (!access.allowed) {
  return { ok: false, code: "like_limit_reached", remaining: access.remaining }
}
```

API returns **429** with `{ code: "LIKE_LIMIT_REACHED", remaining: 0 }` from `api/handlers/discover/like/handler.ts`.

### Profile boost

- Stored on `users.boost_expires_at`
- Default duration: **30 minutes** (`BOOST_DURATION_MINUTES`)
- Discover ranking multiplies boosted profiles by **1.5×** in `server/engines/ranking/ranking.service.ts`
- Premium users activate boost free via `POST /api/subscription/boost`
- Free users get a Stripe one-time checkout; webhook activates boost on `checkout.session.completed` with `metadata.type=boost`

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subscription` | Tier, limits, boost status |
| POST | `/api/subscription/checkout` | Stripe checkout for premium |
| POST | `/api/subscription/boost` | Activate boost (premium) or checkout URL |
| GET | `/api/me` | Includes `user.subscription` summary |

Legacy billing routes (`/api/billing/subscription`, `/api/billing/checkout`, webhook) remain and stay in sync via `user_subscriptions`.

### Examples

```bash
# Current subscription + limits
curl -b cookies.txt https://localhost:3000/api/subscription

# Start premium checkout
curl -X POST -b cookies.txt -H "Content-Type: application/json" \
  -d '{"plan":"premium"}' https://localhost:3000/api/subscription/checkout

# Activate boost (premium → immediate; free → checkout URL)
curl -X POST -b cookies.txt https://localhost:3000/api/subscription/boost
```

## Stripe webhook

`api/handlers/billing/webhook/handler.ts` handles:

- `checkout.session.completed` — subscription **or** boost (`metadata.type=boost`)
- `customer.subscription.updated` / `deleted` — sync plan to `user_subscriptions`

## Client (demo mode)

- `client/lib/monetization/api.ts` — fetch subscription, checkout, boost
- Discover toolbar shows like counter (free) and Premium badge
- Profile premium tab has boost button
- Demo: `setDemoPremium(true)` / localStorage keys for offline testing

## Constants

```typescript
// server/monetization/constants.ts
FREE_LIKES_PER_DAY = 20
BOOST_DURATION_MINUTES = 30
BOOST_SCORE_MULTIPLIER = 1.5
```
