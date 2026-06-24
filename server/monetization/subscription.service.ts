import { getUserSubscription, upsertUserSubscription } from "@/server/billing/repository"
import type { BillingPlan } from "@/server/billing/config"
import { getPremiumUntil } from "@/server/monetization/repository"
import type { SubscriptionStatus, SubscriptionTier, UserSubscription } from "@/server/monetization/types"

const ACTIVE_STATUSES = new Set(["active", "trialing"])

function normalizeTier(plan: string | null | undefined): SubscriptionTier {
  if (plan === "premium" || plan === "vip") return plan
  return "free"
}

function isTierPremium(tier: SubscriptionTier): boolean {
  return tier === "premium" || tier === "vip"
}

export async function getSubscription(userId: string): Promise<UserSubscription> {
  const row = await getUserSubscription(userId)
  const premiumUntil = (await getPremiumUntil(userId)) ?? row?.current_period_end ?? null
  const tier = normalizeTier(row?.plan)
  const status = (row?.status ?? "none") as SubscriptionStatus
  const stripeActive = Boolean(row && ACTIVE_STATUSES.has(row.status) && isTierPremium(tier))
  const graceActive = Boolean(premiumUntil && premiumUntil.getTime() > Date.now())
  const isPremium = stripeActive || graceActive

  return {
    tier: isPremium ? (isTierPremium(tier) ? tier : "premium") : "free",
    status,
    isPremium,
    stripeCustomerId: row?.stripe_customer_id ?? null,
    stripeSubscriptionId: row?.stripe_subscription_id ?? null,
    currentPeriodEnd: row?.current_period_end ?? null,
    premiumUntil,
  }
}

export async function isPremium(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId)
  return sub.isPremium
}

export async function syncFromStripe(input: {
  userId: string
  plan: BillingPlan | "free"
  status: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  currentPeriodEnd?: Date | null
}): Promise<void> {
  await upsertUserSubscription(input)
}

export function serializeSubscription(sub: UserSubscription) {
  return {
    tier: sub.tier,
    status: sub.status,
    isPremium: sub.isPremium,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    premiumUntil: sub.premiumUntil?.toISOString() ?? null,
  }
}
