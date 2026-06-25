# MVP Launch Checklist

## Database

```bash
npm run db:migrate
```

Required migrations: `015` (match engine), `026` (monetization), `027` (analytics + someone_liked_you notifications).

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres |
| `AUTH_SECRET` | JWT sessions |
| `STRIPE_SECRET_KEY` | Checkout + webhooks |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification |
| `STRIPE_PRICE_PREMIUM` | Premium plan price id |
| `STRIPE_PRICE_BOOST` | Boost one-time price id |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | **Required** on multi-instance Vercel — in-memory rate limits do not scale horizontally |
| `CRON_SECRET` | `/api/v1/cron/*` auth |

Run `npm run check:env:strict` before deploy.

## Cron jobs (Vercel / external)

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `POST /api/v1/cron/expire-matches` | Every minute | Expire due matches |
| `POST /api/v1/cron/notify` | Every 5–15 min | Expiry + like notifications |
| `POST /api/v1/cron/cleanup` | Daily | DB hygiene |

Header: `Authorization: Bearer $CRON_SECRET`

## Smoke test

```bash
npm run build
npm run smoke-test
```

## Monetization flows

1. Free user hits 20 likes → paywall modal
2. Likes tab without Premium → blurred teaser + checkout CTA
3. Premium checkout via `/api/subscription/checkout`
4. Boost activates 30 minutes via `/api/subscription/boost` or Stripe boost checkout

## Post-launch

- Monitor `analytics_events` table (signup, like, match, message_sent, purchase)
- Verify Stripe webhook delivery in dashboard
- Push notifications optional — in-app inbox works without push
