-- Phase 3: Stripe subscriptions (Premium / VIP)
BEGIN;

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_plan_chk CHECK (plan IN ('free', 'premium', 'vip')),
  CONSTRAINT user_subscriptions_status_chk CHECK (
    status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'unpaid')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_user_idx ON user_subscriptions (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_stripe_sub_idx
  ON user_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

COMMIT;
