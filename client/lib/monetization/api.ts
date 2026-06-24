import { getAppMode } from "@/client/lib/auth/client"
import { activatePremium, getUserProfile } from "@/client/lib/user-profile"
import type { BoostApiResponse, SubscriptionApiResponse, UserSubscriptionInfo } from "@/client/lib/monetization/types"

const DEMO_PREMIUM_KEY = "ttm-demo-premium"
const DEMO_LIKES_KEY = "ttm-demo-likes-used"
const DEMO_BOOST_KEY = "ttm-demo-boost-until"

function demoLikesUsed(): number {
  if (typeof window === "undefined") return 0
  return Number(localStorage.getItem(DEMO_LIKES_KEY) ?? "0") || 0
}

function demoBoostUntil(): number | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(DEMO_BOOST_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function setDemoPremium(enabled: boolean): void {
  if (typeof window === "undefined") return
  if (enabled) {
    localStorage.setItem(DEMO_PREMIUM_KEY, "1")
    const profile = getUserProfile()
    if (profile) activatePremium(profile, 30 * 24 * 60 * 60 * 1000)
  } else {
    localStorage.removeItem(DEMO_PREMIUM_KEY)
  }
}

export function isDemoPremium(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(DEMO_PREMIUM_KEY) === "1"
}

function demoSubscriptionFallback(): SubscriptionApiResponse {
  const premium = isDemoPremium()
  const boostUntil = demoBoostUntil()
  const boostActive = Boolean(boostUntil && boostUntil > Date.now())
  const used = demoLikesUsed()
  const dailyLimit = 20
  return {
    mode: "demo",
    configured: false,
    subscription: {
      tier: premium ? "premium" : "free",
      status: premium ? "active" : "none",
      isPremium: premium,
      currentPeriodEnd: null,
      premiumUntil: premium ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
    },
    limits: {
      unlimited: premium,
      dailyLimit: premium ? null : dailyLimit,
      usedToday: used,
      remaining: premium ? null : Math.max(0, dailyLimit - used),
      resetsAt: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + 1)).toISOString(),
    },
    boost: {
      active: boostActive,
      expiresAt: boostActive && boostUntil ? new Date(boostUntil).toISOString() : null,
      multiplier: boostActive ? 1.5 : 1,
    },
  }
}

export async function fetchSubscriptionSummary(): Promise<SubscriptionApiResponse> {
  const mode = await getAppMode().catch(() => "production" as const)
  try {
    const res = await fetch("/api/subscription", { credentials: "include", cache: "no-store" })
    if (res.ok) {
      return (await res.json()) as SubscriptionApiResponse
    }
    if (mode === "demo") return demoSubscriptionFallback()
  } catch {
    if (mode === "demo") return demoSubscriptionFallback()
  }
  return demoSubscriptionFallback()
}

export async function startPremiumCheckout(plan: "premium" | "vip" = "premium"): Promise<{ url?: string; demo?: boolean }> {
  const mode = await getAppMode().catch(() => "production" as const)
  try {
    const res = await fetch("/api/subscription/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
    const data = (await res.json()) as { url?: string; message?: string; configured?: boolean }
    if (data.url) return { url: data.url }
    if (mode === "demo" || data.configured === false) {
      setDemoPremium(true)
      return { demo: true }
    }
  } catch {
    if (mode === "demo") {
      setDemoPremium(true)
      return { demo: true }
    }
  }
  return {}
}

export async function activateProfileBoost(): Promise<BoostApiResponse & { demo?: boolean }> {
  const mode = await getAppMode().catch(() => "production" as const)
  try {
    const res = await fetch("/api/subscription/boost", {
      method: "POST",
      credentials: "include",
    })
    const data = (await res.json()) as {
      activated?: boolean
      boost?: UserSubscriptionInfo["boost"]
      url?: string
    }
    if (res.ok && "boost" in data && data.boost) {
      return { activated: true, boost: data.boost }
    }
    if ("url" in data && data.url) {
      return { activated: false, url: data.url }
    }
    if (mode === "demo" || !res.ok) {
      const until = Date.now() + 60 * 60 * 1000
      localStorage.setItem(DEMO_BOOST_KEY, String(until))
      return {
        activated: true,
        demo: true,
        boost: { active: true, expiresAt: new Date(until).toISOString(), multiplier: 1.5 },
      }
    }
  } catch {
    if (mode === "demo") {
      const until = Date.now() + 60 * 60 * 1000
      localStorage.setItem(DEMO_BOOST_KEY, String(until))
      return {
        activated: true,
        demo: true,
        boost: { active: true, expiresAt: new Date(until).toISOString(), multiplier: 1.5 },
      }
    }
  }
  return { activated: true, boost: { active: false, expiresAt: null, multiplier: 1 } }
}

export function trackDemoLike(): void {
  if (typeof window === "undefined" || isDemoPremium()) return
  const next = demoLikesUsed() + 1
  localStorage.setItem(DEMO_LIKES_KEY, String(next))
}
