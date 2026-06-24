import { checkLikeLimit, consumeLike } from "@/server/monetization/limits.service"
import { activateBoost, getBoostStatus, isBoostActive } from "@/server/monetization/boost.service"
import { getSubscription, isPremium } from "@/server/monetization/subscription.service"
import type { BoostAccess, LikeAccess } from "@/server/monetization/types"

export class LikeLimitError extends Error {
  readonly code = "LIKE_LIMIT_REACHED" as const

  constructor(public readonly access: LikeAccess) {
    super("Daily like limit reached")
    this.name = "LikeLimitError"
  }
}

export async function requirePremium(userId: string): Promise<{ ok: true } | { ok: false; code: "premium_required" }> {
  if (await isPremium(userId)) return { ok: true }
  return { ok: false, code: "premium_required" }
}

export async function canUserLike(userId: string): Promise<LikeAccess> {
  const check = await checkLikeLimit(userId)
  return {
    allowed: check.allowed,
    code: check.allowed ? undefined : "LIKE_LIMIT_REACHED",
    remaining: check.remaining,
    unlimited: check.unlimited,
    dailyLimit: check.dailyLimit,
    usedToday: check.usedToday,
  }
}

export async function canLike(userId: string): Promise<LikeAccess> {
  return canUserLike(userId)
}

export async function consumeUserLike(userId: string): Promise<LikeAccess> {
  const access = await canUserLike(userId)
  if (!access.allowed) {
    throw new LikeLimitError(access)
  }
  const limits = await consumeLike(userId)
  return {
    allowed: true,
    remaining: limits.remaining,
    unlimited: limits.unlimited,
    dailyLimit: limits.dailyLimit,
    usedToday: limits.usedToday,
  }
}

export async function canBoost(userId: string): Promise<BoostAccess> {
  const active = await isBoostActive(userId)
  if (active) {
    const status = await getBoostStatus(userId)
    return {
      allowed: false,
      reason: "already_active",
      active: true,
      expiresAt: status.expiresAt,
    }
  }

  const premium = await isPremium(userId)
  if (premium) {
    return { allowed: true, active: false, expiresAt: null }
  }

  return { allowed: true, reason: "checkout_required", active: false, expiresAt: null }
}

export async function getSubscriptionSummary(userId: string) {
  const [subscription, limits, boost] = await Promise.all([
    getSubscription(userId),
    import("@/server/monetization/limits.service").then((m) => m.getLimitsForUser(userId)),
    getBoostStatus(userId),
  ])
  return { subscription, limits, boost }
}

export { activateBoost, getSubscription, isPremium }
