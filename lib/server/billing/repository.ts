import { getDb } from "@/lib/server/db"
import type { BillingPlan } from "@/lib/server/billing/config"

export type SubscriptionRow = {
  user_id: string
  plan: string
  status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: Date | null
}

export async function getUserSubscription(userId: string): Promise<SubscriptionRow | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<SubscriptionRow[]>`
    SELECT user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end
    FROM user_subscriptions
    WHERE user_id = ${userId}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function upsertUserSubscription(input: {
  userId: string
  plan: BillingPlan | "free"
  status: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  currentPeriodEnd?: Date | null
}): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    INSERT INTO user_subscriptions (
      user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at
    )
    VALUES (
      ${input.userId},
      ${input.plan},
      ${input.status},
      ${input.stripeCustomerId ?? null},
      ${input.stripeSubscriptionId ?? null},
      ${input.currentPeriodEnd ?? null},
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_subscriptions.stripe_customer_id),
      stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, user_subscriptions.stripe_subscription_id),
      current_period_end = COALESCE(EXCLUDED.current_period_end, user_subscriptions.current_period_end),
      updated_at = now()
  `
}
