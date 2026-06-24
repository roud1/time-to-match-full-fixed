import { FREE_LIKES_PER_DAY } from "@/server/monetization/constants"
import { getDailyLikesUsed, incrementDailyLikes } from "@/server/monetization/repository"
import { getSubscription } from "@/server/monetization/subscription.service"
import type { LikeLimits } from "@/server/monetization/types"

function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function nextUtcMidnight(from = new Date()): Date {
  const next = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + 1))
  return next
}

export async function getLimitsForUser(userId: string): Promise<LikeLimits> {
  const sub = await getSubscription(userId)
  const likeDate = utcDateKey()
  const usedToday = await getDailyLikesUsed(userId, likeDate)
  const unlimited = sub.isPremium
  const dailyLimit = unlimited ? Infinity : FREE_LIKES_PER_DAY
  const remaining = unlimited ? Infinity : Math.max(0, FREE_LIKES_PER_DAY - usedToday)

  return {
    tier: sub.tier,
    unlimited,
    dailyLimit: unlimited ? -1 : FREE_LIKES_PER_DAY,
    usedToday,
    remaining: unlimited ? -1 : remaining,
    resetsAt: nextUtcMidnight().toISOString(),
  }
}

export async function checkLikeLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  unlimited: boolean
  usedToday: number
  dailyLimit: number
}> {
  const limits = await getLimitsForUser(userId)
  if (limits.unlimited) {
    return {
      allowed: true,
      remaining: -1,
      unlimited: true,
      usedToday: limits.usedToday,
      dailyLimit: -1,
    }
  }

  return {
    allowed: limits.remaining > 0,
    remaining: limits.remaining,
    unlimited: false,
    usedToday: limits.usedToday,
    dailyLimit: FREE_LIKES_PER_DAY,
  }
}

export async function consumeLike(userId: string): Promise<LikeLimits> {
  const check = await checkLikeLimit(userId)
  if (!check.allowed) {
    return getLimitsForUser(userId)
  }

  if (!check.unlimited) {
    await incrementDailyLikes(userId, utcDateKey())
  }

  return getLimitsForUser(userId)
}
