export type SubscriptionTier = "free" | "premium" | "vip"

export type UserSubscriptionInfo = {
  tier: SubscriptionTier
  status: string
  isPremium: boolean
  currentPeriodEnd: string | null
  premiumUntil: string | null
  limits: {
    unlimited: boolean
    dailyLimit: number | null
    usedToday: number
    remaining: number | null
    resetsAt: string
  }
  boost: {
    active: boolean
    expiresAt: string | null
    multiplier: number
  }
}

export type SubscriptionApiResponse = {
  mode: "demo" | "live"
  configured: boolean
  /** Real checkout prices from the server (Stripe config); null when payments are not set up. */
  prices?: {
    premium: { amountCents: number; currency: string; interval: "month" }
    vip: { amountCents: number; currency: string; interval: "month" }
  } | null
  subscription: Omit<UserSubscriptionInfo, "limits" | "boost">
  limits: UserSubscriptionInfo["limits"]
  boost: UserSubscriptionInfo["boost"]
}

export type BoostApiResponse =
  | { activated: true; boost: UserSubscriptionInfo["boost"]; url?: undefined }
  | { activated: false; url: string; sessionId?: string }
