export type SubscriptionTier = "free" | "premium" | "vip"

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "unpaid"
  | "none"

export type UserSubscription = {
  tier: SubscriptionTier
  status: SubscriptionStatus
  isPremium: boolean
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: Date | null
  premiumUntil: Date | null
}

export type LikeLimits = {
  tier: SubscriptionTier
  unlimited: boolean
  dailyLimit: number
  usedToday: number
  remaining: number
  resetsAt: string
}

export type BoostStatus = {
  active: boolean
  expiresAt: string | null
  multiplier: number
}

export type LikeAccess = {
  allowed: boolean
  code?: "LIKE_LIMIT_REACHED"
  remaining: number
  unlimited: boolean
  dailyLimit: number
  usedToday: number
}

export type BoostAccess = {
  allowed: boolean
  reason?: "already_active" | "checkout_required"
  active: boolean
  expiresAt: string | null
}

export type SubscriptionSummary = {
  subscription: UserSubscription
  limits: LikeLimits
  boost: BoostStatus
}
